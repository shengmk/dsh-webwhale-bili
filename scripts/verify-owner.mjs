import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createStore } from '../lib/store.js'

const failures = []
const ok = (condition, message) => { if (!condition) failures.push(message) }
const codeOf = (fn) => {
  try { fn(); return 'no-error' } catch (error) { return error?.code || 'unknown' }
}

const dir = mkdtempSync(join(tmpdir(), 'ww-owner-'))
const store = createStore(dir)
const initial = store.getState().value
ok(initial.owners.activeSource === 'manual', 'owners must default to manual source')
ok(initial.owners.members.length === 0, 'owners must start empty')

let saved = store.setOwners({
  activeSource: 'manual',
  members: [{ mid: '123456789', name: '测试账号', source: 'manual' }],
}).value
ok(saved.owners.activeSource === 'manual', 'manual source must persist')
ok(saved.owners.members.length === 1 && saved.owners.members[0].mid === '123456789', 'manual owner must persist')
ok(saved.logs[0][1] === '更新主人名单', 'owner save must append audit')

ok(codeOf(() => store.setOwners({ activeSource: 'bogus', members: [] })) === 'bad-request', 'invalid source must be rejected')
ok(codeOf(() => store.setOwners({ activeSource: 'manual', members: [{ mid: 'abc', name: 'x' }] })) === 'bad-request', 'non-numeric mid must be rejected')
ok(codeOf(() => store.setOwners({ activeSource: 'manual', members: [{ mid: '2', name: 'x', source: 'bogus' }] })) === 'bad-request', 'invalid member source must be rejected')
ok(codeOf(() => store.setOwners({ activeSource: 'manual', members: [{ mid: '1', name: 'a' }, { mid: '1', name: 'b' }] })) === 'bad-request', 'duplicate mid must be rejected')

saved = store.setOwners({
  activeSource: 'mutual',
  members: [{ mid: '42', name: '互关好友', source: 'mutual' }],
}).value
ok(saved.owners.activeSource === 'mutual', 'mutual source must persist')
ok(saved.owners.members[0].source === 'mutual', 'member source tags must persist')

const reopened = createStore(dir)
const persisted = reopened.getState().value
ok(persisted.owners.activeSource === 'mutual', 'owner source must survive reopen')
ok(persisted.owners.members[0]?.name === '互关好友', 'owner member must survive reopen')
ok(reopened.getOwners().members.length === 1, 'getOwners must return persisted members')

const follow = reopened.requestFollow({ mid: '777', name: '待关注' }).value
ok(follow.followRequests[0]?.status === 'pending', 'follow request must start pending')
ok(follow.followRequests[0]?.mid === '777', 'follow request must keep mid')
ok(codeOf(() => reopened.requestFollow({ mid: '777' })) === 'bad-request', 'duplicate pending follow must be rejected')
const decided = reopened.decideFollow(follow.followRequests[0].id, 'approve').value
ok(decided.followRequests[0]?.status === 'approved', 'follow decision must persist')
ok(reopened.followsToday() === 0, 'approved but not executed must not count')
reopened.beginFollow(follow.followRequests[0].id)
reopened.finishFollow(follow.followRequests[0].id, true)
ok(reopened.followsToday() === 1, 'executed follow must count toward daily limit')
let followReuse = false
try { reopened.beginFollow(follow.followRequests[0].id) } catch (error) { followReuse = error?.code === 'bad-request' }
ok(followReuse, 'executed follow request must not be reusable')
ok(decided.logs[0][1] === '关注确认', 'follow decision must append audit')
let followReplay = false
try { reopened.decideFollow(follow.followRequests[0].id, 'reject') } catch (error) { followReplay = error?.code === 'bad-request' }
ok(followReplay, 'already decided follow must not be flipped')

store.kill()
ok(codeOf(() => store.setOwners({ activeSource: 'manual', members: [] })) === 'killed', 'killed must reject owner writes')

if (failures.length > 0) {
  console.error('verify-owner: FAIL')
  for (const failure of failures) console.error(' - ' + failure)
  process.exit(1)
}
console.log('verify-owner: PASS')
console.log(' - manual/mutual source, member source tags, validation, killed, reopen')
