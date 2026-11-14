/**
 * Background DM auto-reply. Only runs while settings.autoReply is true.
 * B mode: owner + known mutual low-risk -> direct; other low-risk -> review queue.
 */
import { classifyReply } from './policy.js'
import { sendDm } from './bili-write.js'
import { replyWithVoice } from './persona-voice.js'

export function startAutoReply({ store, bili, directory, intervalMs = 90000, warn = () => {}, isCurrentAccount = () => true, getGeneration = () => 0 }) {
  const seen = new Set()
  const cursors = new Map()
  const lastSent = new Map()
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
        let advanced = true
        for (const message of incoming) {
          if (seen.has(message.id) || message.text.includes('我们已互相关注')) continue
          const result = classifyReply({
            source: 'dm',
            fromMid: session.talkerId,
            text: message.text,
            owners,
            knownMids: known,
          })
          if (result.mode === 'ignore') {
            seen.add(message.id)
            store.recordAutoReply({ fromMid: session.talkerId, text: message.text, reply: '', mode: 'ignore' })
            continue
          }
          if (result.mode !== 'direct') {
            store.queueReply({ source: 'dm', fromMid: session.talkerId, text: message.text, knownMids: known })
            try { store.addMemory({ layer: 'short', text: '收到私信：' + message.text.slice(0, 500), tags: ['dm', 'pending'] }) } catch {}
            seen.add(message.id)
            continue
          }
          const last = lastSent.get(session.talkerId) || 0
          if (Date.now() - last < 10 * 60 * 1000) { advanced = false; continue }
          if (!isCurrentAccount() || store.isKilled() || store.getState().value.settings.autoReply !== true || store.getState().value.settings.dmListen !== true) { advanced = false; break }
          const freshOwners = store.getOwners()
          const resultFresh = classifyReply({ source: 'dm', fromMid: session.talkerId, text: message.text, owners: freshOwners, knownMids: known })
          if (resultFresh.mode !== 'direct') {
            store.queueReply({ source: 'dm', fromMid: session.talkerId, text: message.text, knownMids: known })
            seen.add(message.id)
            continue
          }
          const currentSettings = store.getState().value.settings
          const late = Date.now() / 1000 - message.at > 60 * 60
          const reply = replyWithVoice(message.text, currentSettings, { late })
          try {
            await sendDm({
              directory,
              toMid: session.talkerId,
              text: reply,
              guard: () => !stopped && getGeneration() === generation && isCurrentAccount() && !store.isKilled() && store.getState().value.settings.autoReply === true && store.getState().value.settings.dmListen === true,
            })
            lastSent.set(session.talkerId, Date.now())
            seen.add(message.id)
            store.recordAutoReply({ fromMid: session.talkerId, text: message.text, reply, mode: 'direct' })
            try { store.addMemory({ layer: 'short', text: '私信：' + message.text.slice(0, 300) + ' → ' + reply, tags: ['dm', 'reply'] }) } catch {}
          } catch (error) {
            // Unknown outcome: do not auto-retry; a timeout may have been delivered.
            seen.add(message.id)
            lastSent.set(session.talkerId, Date.now())
            store.recordAutoReply({ fromMid: session.talkerId, text: message.text, reply: '', mode: 'unknown' })
            warn('auto-reply send outcome unknown: ' + (error?.message || error))
          }
        }
        if (advanced) cursors.set(session.talkerId, latest)
      }
    } catch (error) {
      warn('auto-reply tick failed: ' + (error?.message || error))
    } finally {
      running = false
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

  schedule()
  return {
    tick,
    invalidateMutual() { mutualCache = { at: 0, members: [] } },
    stop() {
      stopped = true
      if (timer) clearTimeout(timer)
      timer = null
    },
  }
}
