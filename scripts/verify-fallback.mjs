import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

process.env.WW_DISABLE_SQLITE = '1'
const { createStore } = await import('../lib/store.js')
const failures = []
const ok = (condition, message) => { if (!condition) failures.push(message) }

const dir = mkdtempSync(join(tmpdir(), 'ww-json-'))
const store = createStore(dir)
ok(store.sqlite === false, 'fallback test must run without node:sqlite')
store.setOwners({ activeSource: 'manual', members: [{ mid: '123', name: '主人', source: 'manual' }] })
store.queueReply({ source: 'comment', fromMid: '999', text: '插件叫什么' })
store.requestFollow({ mid: '777', name: '待关注' })
const reopened = createStore(dir)
const state = reopened.getState().value
ok(reopened.sqlite === false, 'reopen must stay on JSON fallback')
ok(state.owners.members[0]?.mid === '123', 'owners must survive JSON reopen')
ok(state.replyQueue[0]?.status === 'pending', 'replyQueue must survive JSON reopen')
ok(state.followRequests[0]?.status === 'pending', 'followRequests must survive JSON reopen')

if (failures.length > 0) {
  console.error('verify-fallback: FAIL')
  for (const failure of failures) console.error(' - ' + failure)
  process.exit(1)
}
console.log('verify-fallback: PASS')
console.log(' - JSON fallback persists owners/replyQueue/followRequests across reopen')
