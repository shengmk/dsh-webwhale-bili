import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createStore } from '../lib/store.js'
import { startCommentReply } from '../lib/comment-reply.js'

const failures = []
const ok = (condition, message) => { if (!condition) failures.push(message) }
const dir = mkdtempSync(join(tmpdir(), 'ww-comment-flow-'))

try {
  const store = createStore(dir)
  store.setOwners({ activeSource: 'manual', members: [{ mid: '200', name: '主人', source: 'manual', enabled: true }] })
  store.setSettings({ commentListen: true, autoReply: true, automationArmed: true, commentBvids: 'BV1GJ411x7h7' })
  const sent = []
  const bili = {
    comments: async () => ({ bvid: 'BV1GJ411x7h7', comments: [{ id: 'r1', mid: '200', who: '主人', text: '做一下自我介绍吧', at: Math.floor(Date.now() / 1000), likes: 1 }] }),
  }
  const worker = startCommentReply({
    store,
    bili,
    directory: dir,
    intervalMs: 60 * 60 * 1000,
    send: async (args) => { sent.push(args); return { ok: true } },
  })
  await worker.tick()
  worker.stop()
  ok(sent.length === 1, 'comment flow must send one owner reply')
  ok(sent[0]?.bvid === 'BV1GJ411x7h7', 'comment send must target bvid')
  ok(sent[0]?.root === 'r1', 'comment send must preserve root')
  ok(store.listOutbox('default')[0]?.status === 'sent', 'comment outbox must be sent')
  ok(store.listCandidates('default', 'approved').length === 1, 'approved candidate must persist')
  if (failures.length > 0) {
    console.error('verify-02-comment-flow: FAIL')
    for (const failure of failures) console.error(' - ' + failure)
    process.exit(1)
  }
  console.log('verify-02-comment-flow: PASS')
  console.log(' - BV comment -> inbox -> candidate -> review -> outbox -> sender')
} catch (error) {
  console.error('verify-02-comment-flow: FAIL')
  console.error(' - ' + (error?.stack || error))
  process.exit(1)
} finally { try { rmSync(dir, { recursive: true, force: true }) } catch {} }
