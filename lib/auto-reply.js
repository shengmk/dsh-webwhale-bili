/**
 * Background DM auto-reply. Only runs while settings.autoReply is true.
 * B mode: owner + known mutual low-risk -> direct; other low-risk -> review queue.
 */
import { classifyReply } from './policy.js'
import { sendDm } from './bili-write.js'
import { replyWithVoice } from './persona-voice.js'

let activeAutoReply = null

export function startAutoReply({ store, bili, directory, intervalMs = 90000, warn = () => {}, isCurrentAccount = () => true, getGeneration = () => 0 }) {
  if (activeAutoReply) activeAutoReply.stop()
  const seen = new Set()
  const cursors = new Map()
  const lastSent = new Map()
  const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
  let timer = null
  let running = false
  let mutualCache = { at: 0, members: [] }
  let stopped = false

  async function knownMids(force = false) {
    if (!force && Date.now() - mutualCache.at < 5 * 60 * 1000) return mutualCache.members
    try {
      const mutual = await bili.mutual()
      mutualCache = { at: Date.now(), members: mutual.members.map((member) => member.mid) }
    } catch (error) {
      warn('auto-reply mutual cache failed: ' + (error?.message || error))
      mutualCache = { at: Date.now(), members: [] }
    }
    return mutualCache.members
  }

  async function tick() {
    if (running || stopped) return
    running = true
    const generation = getGeneration()
    try {
      const state = store.getState().value
      if (!state.settings.autoReply || !state.settings.dmListen || state.settings.automationArmed !== true || store.isKilled()) return
      if (!isCurrentAccount()) return
      const hour = Number(new Date().toLocaleString('en-GB', { timeZone: 'Asia/Shanghai', hour: '2-digit', hour12: false }))
      if (state.settings.quietHours && hour >= 0 && hour < 7) return
      const owners = store.getOwners()
      const known = await knownMids()
      const sessions = await bili.dmSessions()
      for (const session of sessions.slice(0, 10)) {
        if (/社区中心|系统通知/.test(session.name)) continue
        const messages = await bili.dmMessages(session.talkerId)
        if (messages.length === 0) continue
        const latest = Math.max(...messages.map((message) => message.at))
        if (!cursors.has(session.talkerId)) {
          // On first armed run, catch up recent messages (last 24h, max 5 per chat)
          // instead of silently skipping everything that arrived while DSH was closed.
          const since = Math.floor(Date.now() / 1000) - 24 * 60 * 60
          const recent = messages
            .filter((message) => message.sender === session.talkerId && message.at >= since)
            .slice(-5)
          if (recent.length === 0) {
            cursors.set(session.talkerId, latest)
            continue
          }
          cursors.set(session.talkerId, Math.min(...recent.map((message) => message.at)) - 1)
        }
        const cursor = cursors.get(session.talkerId) || 0
        const incoming = messages
          .filter((message) => message.at > cursor && message.sender === session.talkerId && message.text.trim() !== '')
          .sort((a, b) => a.at - b.at)
        if (incoming.length > 0) store.setReplyState(session.talkerId, { count: 0, date: today(), lastIncomingAt: Math.max(...incoming.map((message) => message.at)) })
        let advanced = true
        for (const message of incoming) {
          const stateBefore = store.getReplyState(session.talkerId)
          if (Number(stateBefore.count || 0) >= 1) break
          if (Number(stateBefore.lastOutboundAt || 0) >= Number(message.at || 0)) { seen.add(message.id); continue }
          if (message.sender === store.getState().value.account?.mid) { seen.add(message.id); continue }
          if (seen.has(message.id) || message.text.includes('我们已互相关注')) continue
          const accountId = String(store.getState().value.account?.mid || 'default')
          if (!store.claimInbox({ accountId, talkerId: session.talkerId, msgId: message.id, at: message.at, text: message.text })) { seen.add(message.id); continue }
          const result = classifyReply({
            source: 'dm',
            fromMid: session.talkerId,
            text: message.text,
            owners,
            knownMids: known,
          })
          if (result.mode === 'ignore') {
            store.markInbox({ accountId, talkerId: session.talkerId, msgId: message.id, state: 'ignored' })
            seen.add(message.id)
            store.recordAutoReply({ fromMid: session.talkerId, text: message.text, reply: '', mode: 'ignore' })
            continue
          }
          if (result.mode !== 'direct') {
            store.queueReply({ source: 'dm', fromMid: session.talkerId, text: message.text, knownMids: known })
            store.markInbox({ accountId, talkerId: session.talkerId, msgId: message.id, state: 'queued' })
            try { store.addMemory({ layer: 'short', text: '收到私信：' + message.text.slice(0, 500), tags: ['dm', 'pending'] }) } catch {}
            seen.add(message.id)
            continue
          }
          const currentSettings = store.getState().value.settings
          const persistedLast = Number(stateBefore.lastSentAt || 0)
          const dailyCount = stateBefore.dmDayDate === today() ? Number(stateBefore.dmDayCount || 0) : 0
          if (dailyCount >= 10) {
            store.markInbox({ accountId, talkerId: session.talkerId, msgId: message.id, state: 'ignored' })
            seen.add(message.id)
            continue
          }
          if (!isCurrentAccount() || store.isKilled() || currentSettings.autoReply !== true || currentSettings.dmListen !== true) { advanced = false; break }
          const freshOwners = store.getOwners()
          const resultFresh = classifyReply({ source: 'dm', fromMid: session.talkerId, text: message.text, owners: freshOwners, knownMids: known })
          if (resultFresh.mode !== 'direct') {
            store.queueReply({ source: 'dm', fromMid: session.talkerId, text: message.text, knownMids: known })
            store.markInbox({ accountId, talkerId: session.talkerId, msgId: message.id, state: 'queued' })
            seen.add(message.id)
            continue
          }
          const late = Date.now() / 1000 - message.at > 60 * 60
          const allowLate = late && store.getReplyState(session.talkerId).lateDate !== today()
          const memories = store.listMemory().slice(0, 40)
          const context = messages.slice(0, 6)
          const reply = replyWithVoice(message.text, currentSettings, { late: allowLate, memories, context })
          if (!reply) {
            store.markInbox({ accountId, talkerId: session.talkerId, msgId: message.id, state: 'ignored' })
            seen.add(message.id)
            store.recordAutoReply({ fromMid: session.talkerId, text: message.text, reply: '', mode: 'noop' })
            continue
          }
          if (stateBefore.lastReplyText === reply && Date.now() - Number(stateBefore.lastReplyAt || 0) < 30 * 60 * 1000) {
            store.markInbox({ accountId, talkerId: session.talkerId, msgId: message.id, state: 'ignored' })
            seen.add(message.id)
            continue
          }
          const nextAt = new Date(Math.max(Date.now(), persistedLast + 20 * 60 * 1000)).toISOString()
          const queued = store.enqueueOutbox({ accountId, talkerId: session.talkerId, msgId: message.id, msgAt: message.at, text: reply, nextAt })
          store.markInbox({ accountId, talkerId: session.talkerId, msgId: message.id, state: queued.duplicate ? 'queued' : 'replied' })
          seen.add(message.id)
        }
        if (advanced) cursors.set(session.talkerId, latest)
      }
      await pumpOutbox()
    } catch (error) {
      warn('auto-reply tick failed: ' + (error?.message || error))
    } finally {
      running = false
    }
  }

  async function pumpOutbox() {
    if (stopped || !isCurrentAccount() || store.isKilled()) return
    const settings = store.getState().value.settings
    if (settings.autoReply !== true || settings.dmListen !== true || settings.automationArmed !== true) return
    const accountId = String(store.getState().value.account?.mid || 'default')
    const item = store.claimOutbox(accountId)
    if (!item) return
    const stateBefore = store.getReplyState(item.talkerId)
    const lastSentAt = Number(stateBefore.lastSentAt || 0)
    const dailyCount = stateBefore.dmDayDate === today() ? Number(stateBefore.dmDayCount || 0) : 0
    if (Date.now() - lastSentAt < 20 * 60 * 1000 || dailyCount >= 3) {
      store.completeOutbox(item.id, 'pending')
      return
    }
    if (stateBefore.lastReplyText === item.text && Date.now() - Number(stateBefore.lastReplyAt || 0) < 30 * 60 * 1000) {
      store.completeOutbox(item.id, 'failed', 'duplicate reply text')
      store.markInbox({ accountId, talkerId: item.talkerId, msgId: item.msgId, state: 'ignored' })
      return
    }
    try {
      await sendDm({
        directory,
        toMid: item.talkerId,
        text: item.text,
        guard: () => !stopped && getGeneration() === generation && isCurrentAccount() && !store.isKilled() && store.getState().value.settings.autoReply === true && store.getState().value.settings.dmListen === true,
      })
      store.setReplyState(item.talkerId, { count: 1, date: today(), lastOutboundAt: item.msgAt, lastSentAt: Date.now(), lastReplyText: item.text, lastReplyAt: Date.now(), dmDayDate: today(), dmDayCount: dailyCount + 1 })
      store.completeOutbox(item.id, 'sent')
      store.markInbox({ accountId, talkerId: item.talkerId, msgId: item.msgId, state: 'replied' })
      store.recordAutoReply({ fromMid: item.talkerId, text: '', reply: item.text, mode: 'direct' })
      try { store.addMemory({ layer: 'short', text: '私信回复：' + item.text.slice(0, 300), tags: ['dm', 'reply'] }) } catch {}
    } catch (error) {
      store.setReplyState(item.talkerId, { count: 1, date: today(), lastOutboundAt: item.msgAt, lastSentAt: Date.now(), lastReplyText: item.text, lastReplyAt: Date.now(), dmDayDate: today(), dmDayCount: dailyCount + 1 })
      store.completeOutbox(item.id, 'unknown', error?.message || String(error))
      store.markInbox({ accountId, talkerId: item.talkerId, msgId: item.msgId, state: 'unknown' })
      warn('auto-reply send outcome unknown: ' + (error?.message || error))
    }
  }

  function schedule() {
    if (stopped) return
    timer = setTimeout(async () => {
      await tick()
      schedule()
    }, intervalMs)
    timer.unref?.()
  }

  const api = {
    tick,
    invalidateMutual() { mutualCache = { at: 0, members: [] } },
    stop() {
      stopped = true
      if (timer) clearTimeout(timer)
      timer = null
      if (activeAutoReply === api) activeAutoReply = null
    },
  }
  activeAutoReply = api
  schedule()
  return api
}
