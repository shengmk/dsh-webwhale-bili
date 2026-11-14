/**
 * Background DM auto-reply. Only runs while settings.autoReply is true.
 * B mode: owner + known mutual low-risk -> direct; other low-risk -> review queue.
 */
import { classifyReply } from './policy.js'
import { sendDm } from './bili-write.js'
import { replyWithVoice } from './persona-voice.js'
import { saveRemoteImage } from './assets.js'

let activeAutoReply = null

export function enqueueReplyParts(store, { accountId, talkerId, msgId, msgAt = 0, parts = [], nextAt } = {}) {
  const cleaned = (Array.isArray(parts) ? parts : []).map((part) => String(part || '').trim()).filter(Boolean).slice(0, 3)
  let queuedAny = false
  for (let partIndex = 0; partIndex < cleaned.length; partIndex += 1) {
    const split = cleaned.length > 1
    const queued = store.enqueueOutbox({
      accountId,
      talkerId,
      msgId: split ? msgId + ':p' + (partIndex + 1) : msgId,
      msgAt,
      text: cleaned[partIndex],
      nextAt,
      target: { sourceMsgId: msgId, replyGroup: msgId, part: partIndex + 1, total: cleaned.length },
    })
    if (!queued.duplicate) queuedAny = true
  }
  return { queuedAny, count: cleaned.length }
}

export function startAutoReply({ store, bili, directory, modelChat = null, intervalMs = 90000, warn = () => {}, isCurrentAccount = () => true, getGeneration = () => 0 }) {
  if (activeAutoReply) activeAutoReply.stop()
  const seen = new Set()
  const cursors = new Map()
  const lastSent = new Map()
  const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
  let timer = null
  let pumpTimer = null
  let running = false
  let pumping = false
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

  function fallbackAck(id) {
    const pool = ['听到啦。', '嗯，听到了。', '我在，听到啦。']
    let n = 0
    for (const ch of String(id || '')) n = (n + ch.charCodeAt(0)) % pool.length
    return pool[n]
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
      // Flush queued sends before any network scan; a slow dmSessions call must never block the sender.
      await pumpOutbox()
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
          .filter((message) => message.at > cursor && message.sender === session.talkerId && (message.text.trim() !== '' || message.image?.url))
          .sort((a, b) => a.at - b.at)
        if (incoming.length > 0) store.setReplyState(session.talkerId, { count: 0, date: today(), lastIncomingAt: Math.max(...incoming.map((message) => message.at)) })
        let advanced = true
        for (const message of incoming) {
          const stateBefore = store.getReplyState(session.talkerId)
          const bodyText = String(message.text || '').trim() || '[图片]'
          if (message.sender === store.getState().value.account?.mid) { seen.add(message.id); continue }
          if (seen.has(message.id) || bodyText.includes('我们已互相关注')) continue
          const accountId = String(store.getState().value.account?.mid || 'default')
          if (!store.claimInbox({ accountId, talkerId: session.talkerId, msgId: message.id, at: message.at, text: bodyText })) { seen.add(message.id); continue }
          const result = classifyReply({
            source: 'dm',
            fromMid: session.talkerId,
            text: bodyText,
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
            store.queueReply({ source: 'dm', fromMid: session.talkerId, text: bodyText, knownMids: known })
            store.markInbox({ accountId, talkerId: session.talkerId, msgId: message.id, state: 'queued' })
            try { store.addMemory({ layer: 'short', text: '收到私信：' + bodyText.slice(0, 500), tags: ['dm', 'pending', message.image?.url ? 'image' : 'text'] }) } catch {}
            seen.add(message.id)
            continue
          }
          const currentSettings = store.getState().value.settings
          const dailyCount = stateBefore.dmDayDate === today() ? Number(stateBefore.dmDayCount || 0) : 0
          const dailyLimit = Math.max(0, Number(store.getState().value.settings.dmDailyLimit ?? 10))
          if (dailyCount >= dailyLimit) {
            store.markInbox({ accountId, talkerId: session.talkerId, msgId: message.id, state: 'ignored' })
            seen.add(message.id)
            continue
          }
          if (!isCurrentAccount() || store.isKilled() || currentSettings.autoReply !== true || currentSettings.dmListen !== true) { advanced = false; break }
          const freshOwners = store.getOwners()
          const resultFresh = classifyReply({ source: 'dm', fromMid: session.talkerId, text: bodyText, owners: freshOwners, knownMids: known })
          if (resultFresh.mode !== 'direct') {
            store.queueReply({ source: 'dm', fromMid: session.talkerId, text: bodyText, knownMids: known })
            store.markInbox({ accountId, talkerId: session.talkerId, msgId: message.id, state: 'queued' })
            seen.add(message.id)
            continue
          }
          if (message.image?.url) {
            try {
              await saveRemoteImage(store, 'emoji-incoming', {
                url: message.image.url,
                name: 'dm-' + String(message.id).replace(/[^A-Za-z0-9_-]/g, '').slice(0, 48),
                meta: { talkerId: session.talkerId, msgId: message.id, width: message.image.width, height: message.image.height },
              })
            } catch (error) {
              warn('incoming image save failed: ' + (error?.message || error))
            }
          }
          const late = Date.now() / 1000 - message.at > 60 * 60
          const allowLate = late && store.getReplyState(session.talkerId).lateDate !== today()
          const memories = store.listMemory().slice(0, 40)
          const context = messages.slice(0, 6)
          const modelReply = await modelChat?.reply?.({ talkerId: session.talkerId, name: session.name, text: bodyText, settings: currentSettings })
          const modelParts = Array.isArray(modelReply?.parts) ? modelReply.parts.map((part) => String(part || '').trim()).filter(Boolean).slice(0, 3) : []
          let reply = String(modelReply?.text || '').trim()
          if (!reply) reply = replyWithVoice(bodyText, currentSettings, { late: allowLate, memories, context })
          if (!reply) reply = fallbackAck(message.id)
          const parts = (modelParts.length > 0 ? modelParts : [reply]).map((part) => String(part || '').trim()).filter(Boolean).slice(0, 3)
          const nextAt = new Date().toISOString()
          const queued = enqueueReplyParts(store, { accountId, talkerId: session.talkerId, msgId: message.id, msgAt: message.at, parts, nextAt })
          store.markInbox({ accountId, talkerId: session.talkerId, msgId: message.id, state: queued.queuedAny ? 'replied' : 'queued' })
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
    if (pumping) return
    pumping = true
    try {
      await pumpOutboxInner()
    } finally {
      pumping = false
    }
  }

  async function pumpOutboxInner() {
    const generation = getGeneration()
    if (stopped || !isCurrentAccount() || store.isKilled()) return
    const settings = store.getState().value.settings
    if (settings.autoReply !== true || settings.dmListen !== true || settings.automationArmed !== true) return
    const accountId = String(store.getState().value.account?.mid || 'default')
    for (let index = 0; index < 5; index += 1) {
      const item = store.claimOutbox(accountId)
      if (!item) return
      const stateBefore = store.getReplyState(item.talkerId)
      const dailyCount = stateBefore.dmDayDate === today() ? Number(stateBefore.dmDayCount || 0) : 0
      const dailyLimit = Math.max(0, Number(store.getState().value.settings.dmDailyLimit ?? 10))
      if (dailyCount >= dailyLimit) {
        store.completeOutbox(item.id, 'pending')
        return
      }
      try {
        await sendDm({
          directory,
          toMid: item.talkerId,
          text: item.text,
          guard: () => !stopped && getGeneration() === generation && isCurrentAccount() && !store.isKilled() && store.getState().value.settings.autoReply === true && store.getState().value.settings.dmListen === true,
        })
        store.setReplyState(item.talkerId, { count: 1, date: today(), lastOutboundAt: item.msgAt, lastSentAt: Date.now(), lastDmReplyText: item.text, lastDmReplyAt: Date.now(), dmLastSentAt: Date.now(), dmDayDate: today(), dmDayCount: dailyCount + 1 })
        store.completeOutbox(item.id, 'sent')
        let target = item.target
        try { if (typeof target === 'string') target = JSON.parse(target) } catch {}
        const sourceMsgId = target?.sourceMsgId || item.msgId
        store.markInbox({ accountId, talkerId: item.talkerId, msgId: sourceMsgId, state: 'replied' })
        store.recordAutoReply({ fromMid: item.talkerId, text: '', reply: item.text, mode: 'direct' })
        try { store.addMemory({ layer: 'short', text: '私信回复：' + item.text.slice(0, 300), tags: ['dm', 'reply'] }) } catch {}
      } catch (error) {
        store.completeOutbox(item.id, 'unknown', error?.message || String(error))
        let target = item.target
        try { if (typeof target === 'string') target = JSON.parse(target) } catch {}
        store.markInbox({ accountId, talkerId: item.talkerId, msgId: target?.sourceMsgId || item.msgId, state: 'unknown' })
        warn('auto-reply send outcome unknown: ' + (error?.message || error))
        return
      }
      await new Promise((resolve) => setTimeout(resolve, 900))
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

  function schedulePump() {
    if (stopped) return
    pumpTimer = setInterval(() => { pumpOutbox().catch(() => {}) }, 10000)
    pumpTimer.unref?.()
  }

  const api = {
    tick,
    invalidateMutual() { mutualCache = { at: 0, members: [] } },
    stop() {
      stopped = true
      if (timer) clearTimeout(timer)
      timer = null
      if (pumpTimer) clearInterval(pumpTimer)
      pumpTimer = null
      if (activeAutoReply === api) activeAutoReply = null
    },
  }
  activeAutoReply = api
  schedule()
  schedulePump()
  setTimeout(() => { tick().catch(() => {}) }, 1000)
  return api
}
