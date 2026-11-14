import { classifyReply } from './policy.js'
import { proposeCandidate } from './ai-workflow.js'
import { applyReview } from './review-workflow.js'
import { postComment } from './bili-write.js'

let activeCommentWorker = null

export function startCommentReply({ store, bili, directory, intervalMs = 5 * 60 * 1000, warn = () => {}, isCurrentAccount = () => true, getGeneration = () => 0, send = postComment }) {
  if (activeCommentWorker) activeCommentWorker.stop()
  let timer = null
  let running = false
  let stopped = false
  const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())

  function settings() { return store.getState().value.settings }
  function accountId() { return String(store.getState().value.account?.mid || 'default') }
  function bvids() { return String(settings().commentBvids || '').split(/\r?\n/).map((x) => x.trim()).filter((x) => /^BV[0-9A-Za-z]{10}$/.test(x)).slice(0, 5) }

  async function pumpCommentOutbox() {
    if (stopped || !isCurrentAccount() || store.isKilled()) return
    const s = settings()
    if (s.commentListen !== true || s.autoReply !== true || s.automationArmed !== true) return
    const item = store.claimOutbox(accountId(), 'comment')
    if (!item) return
    const state = store.getReplyState(item.talkerId)
    const last = Number(state.lastSentAt || 0)
    const daily = state.dayDate === today() ? Number(state.dayCount || 0) : 0
    if (Date.now() - last < 20 * 60 * 1000 || daily >= 3) { store.completeOutbox(item.id, 'pending'); return }
    let target = null
    try { target = item.target ? JSON.parse(item.target) : null } catch {}
    if (!target?.bvid) { store.completeOutbox(item.id, 'failed', 'comment target missing'); return }
    try {
      await send({ bvid: target.bvid, root: target.root || '', parent: target.parent || '', text: item.text, guard: () => !stopped && getGeneration() === generation && isCurrentAccount() && !store.isKilled() })
      store.setReplyState(item.talkerId, { count: 1, date: today(), lastOutboundAt: item.msgAt, lastSentAt: Date.now(), lastReplyText: item.text, lastReplyAt: Date.now(), dayDate: today(), dayCount: daily + 1 })
      store.completeOutbox(item.id, 'sent')
      store.markInbox({ accountId: accountId(), talkerId: item.talkerId, msgId: item.msgId, state: 'replied' })
      store.recordAutoReply({ fromMid: item.talkerId, text: '', reply: item.text, mode: 'comment' })
    } catch (error) {
      store.completeOutbox(item.id, 'unknown', error?.message || String(error))
      store.markInbox({ accountId: accountId(), talkerId: item.talkerId, msgId: item.msgId, state: 'unknown' })
      warn('comment send outcome unknown: ' + (error?.message || error))
    }
  }

  async function tick() {
    if (running || stopped) return
    running = true
    try {
      const s = settings()
      if (!s.commentListen || s.autoReply !== true || s.automationArmed !== true || store.isKilled() || !isCurrentAccount()) return
      const owners = store.getOwners()
      const known = owners.members?.filter((m) => m.enabled !== false).map((m) => String(m.mid)) || []
      const rows = []
      for (const bvid of bvids()) {
        let feed
        try { feed = await bili.comments({ bvid }) } catch (error) { warn('comment feed failed: ' + (error?.message || error)); continue }
        for (const row of feed.comments.slice(0, 20)) rows.push({ ...row, bvid, root: row.id, parent: row.id })
      }
      if (typeof bili.commentMentions === 'function') {
        try {
          const mentions = await bili.commentMentions()
          for (const item of mentions) {
            if (!item.bvid || !item.mid) continue
            rows.push({ ...item, id: item.rpid || item.sourceId || item.id, root: item.rootId || item.sourceId || item.id, parent: item.sourceId || item.id })
          }
        } catch (error) { warn('comment mentions unavailable: ' + (error?.message || error)) }
      }
      const cutoff = Math.floor(Date.now() / 1000) - 60 * 60
      let handled = 0
      for (const row of rows) {
        if (handled >= 2) break
        if (!row.mid || row.mid === accountId() || Number(row.at) < cutoff) continue
        const msgId = 'comment:' + row.bvid + ':' + row.id
        if (!store.claimInbox({ accountId: accountId(), talkerId: row.mid, msgId, at: row.at, text: row.text })) continue
        const result = classifyReply({ source: 'comment', fromMid: row.mid, text: row.text, owners, knownMids: known })
        if (result.mode === 'ignore') { store.markInbox({ accountId: accountId(), talkerId: row.mid, msgId, state: 'ignored' }); continue }
        const reply = proposeCandidate({ store, text: row.text, settings: s })
        if (!reply) { store.markInbox({ accountId: accountId(), talkerId: row.mid, msgId, state: 'ignored' }); continue }
        const candidate = store.createCandidate({ accountId: accountId(), source: 'comment', talkerId: row.mid, msgId, bvid: row.bvid, root: row.root || row.id, parent: row.parent || row.id, reply })
        const reviewed = applyReview({ store, candidateId: candidate.item.id, result })
        if (reviewed.status !== 'approved') {
          store.queueReply({ source: 'comment', fromMid: row.mid, text: row.text, knownMids: known })
          store.markInbox({ accountId: accountId(), talkerId: row.mid, msgId, state: 'candidate' })
          continue
        }
        const state = store.getReplyState(row.mid)
        const daily = state.dayDate === today() ? Number(state.dayCount || 0) : 0
        if (daily >= 3) { store.markInbox({ accountId: accountId(), talkerId: row.mid, msgId, state: 'ignored' }); continue }
        store.enqueueOutbox({ accountId: accountId(), talkerId: row.mid, msgId, msgAt: row.at, kind: 'comment', target: { bvid: row.bvid, root: row.root || row.id, parent: row.parent || row.id }, text: reply, nextAt: new Date().toISOString() })
        store.markInbox({ accountId: accountId(), talkerId: row.mid, msgId, state: 'replied' })
        handled += 1
      }
      await pumpCommentOutbox()
    } catch (error) {
      warn('comment worker failed: ' + (error?.message || error))
    } finally { running = false }
  }

  function schedule() {
    if (stopped) return
    timer = setTimeout(async () => { await tick(); schedule() }, intervalMs)
    timer.unref?.()
  }
  const api = {
    tick,
    stop() { stopped = true; if (timer) clearTimeout(timer); timer = null; if (activeCommentWorker === api) activeCommentWorker = null },
  }
  activeCommentWorker = api
  schedule()
  return api
}
