import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createStore } from '../lib/store.js'
import { startCommentReply } from '../lib/comment-reply.js'

const failures = []
const ok = (condition, message) => { if (!condition) failures.push(message) }
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
const dir = mkdtempSync(join(tmpdir(), 'ww-quota-'))

try {
  const store = createStore(dir)
  store.setOwners({ activeSource: 'manual', members: [{ mid: '200', name: '主人', source: 'manual', enabled: true }] })
  store.setSettings({ commentListen: true, autoReply: true, automationArmed: true, commentBvids: 'BV1GJ411x7h7', commentDailyLimit: '10', dmDailyLimit: '1' })
  const bili = { comments: async () => ({ bvid: 'BV1GJ411x7h7', comments: [{ id: 'r1', mid: '200', who: '主人', text: '做一下自我介绍吧', at: Math.floor(Date.now() / 1000) }] }) }
  const sent = []

  // DM quota exhausted must not block comment quota.
  store.setReplyState('200', { dmDayDate: today, dmDayCount: 10, commentDayDate: today, commentDayCount: 0 })
  const worker = startCommentReply({ store, bili, directory: dir, intervalMs: 3600000, send: async (args) => { sent.push(args); return { ok: true } } })
  await worker.tick()
  ok(sent.length === 1, 'DM quota must not block comment quota')
  worker.stop()

  // Comment quota exhausted must block comment send.
  const store2 = createStore(mkdtempSync(join(tmpdir(), 'ww-quota2-')))
  store2.setOwners({ activeSource: 'manual', members: [{ mid: '200', name: '主人', source: 'manual', enabled: true }] })
  store2.setSettings({ commentListen: true, autoReply: true, automationArmed: true, commentBvids: 'BV1GJ411x7h7', commentDailyLimit: '10' })
  store2.setReplyState('200', { commentDayDate: today, commentDayCount: 10 })
  const sent2 = []
  const worker2 = startCommentReply({ store: store2, bili, directory: dir, intervalMs: 3600000, send: async (args) => { sent2.push(args); return { ok: true } } })
  await worker2.tick()
  ok(sent2.length === 0, 'comment daily quota 10 must block comment send')
  worker2.stop()

  if (failures.length > 0) {
    console.error('verify-02-quota: FAIL')
    for (const failure of failures) console.error(' - ' + failure)
    process.exit(1)
  }
  console.log('verify-02-quota: PASS')
  console.log(' - DM/comment quotas are independent; comment limit blocks send')
} catch (error) {
  console.error('verify-02-quota: FAIL')
  console.error(' - ' + (error?.stack || error))
  process.exit(1)
} finally { try { rmSync(dir, { recursive: true, force: true }) } catch {} }
