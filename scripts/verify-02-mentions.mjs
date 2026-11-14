import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createStore } from '../lib/store.js'
import { startCommentReply } from '../lib/comment-reply.js'

const failures = []
const ok = (condition, message) => { if (!condition) failures.push(message) }
const dir = mkdtempSync(join(tmpdir(), 'ww-mentions-'))
try {
  const store = createStore(dir)
  store.setOwners({ activeSource: 'manual', members: [{ mid: '200', name: '主人', source: 'manual', enabled: true }] })
  store.setSettings({ commentListen: true, autoReply: true, automationArmed: true, commentBvids: 'BV1GJ411x7h7' })
  const sent = []
  const bili = {
    comments: async () => ({ bvid: 'BV1GJ411x7h7', comments: [] }),
    commentMentions: async () => [{ id: 'notify1', rpid: 'rpid1', mid: '200', who: '主人', text: '做一下自我介绍吧', at: Math.floor(Date.now() / 1000), bvid: 'BV1GJ411x7h7', rootId: 'rpid1', sourceId: 'rpid1' }],
  }
  const worker = startCommentReply({ store, bili, directory: dir, intervalMs: 3600000, send: async (args) => { sent.push(args); return { ok: true } } })
  await worker.tick()
  worker.stop()
  ok(sent.length === 1, 'mention must produce one send')
  ok(sent[0]?.root === 'rpid1', 'mention must preserve root')
  ok(store.listCandidates('default', 'approved').length === 1, 'mention candidate must be approved')
  if (failures.length) { console.error('verify-02-mentions: FAIL'); failures.forEach((x) => console.error(' - ' + x)); process.exit(1) }
  console.log('verify-02-mentions: PASS')
  console.log(' - comment mention -> candidate -> review -> outbox -> sender')
} catch (error) {
  console.error('verify-02-mentions: FAIL'); console.error(' - ' + (error?.stack || error)); process.exit(1)
} finally { try { rmSync(dir, { recursive: true, force: true }) } catch {} }
