import { classifyReply } from '../lib/policy.js'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createStore } from '../lib/store.js'

const failures = []
const ok = (condition, message) => { if (!condition) failures.push(message) }
const owners = { activeSource: 'manual', members: [{ mid: '123', name: '主人', source: 'manual', enabled: true }] }

ok(classifyReply({ source: 'at', fromMid: '999', text: '在吗', owners }).mode === 'ignore', 'non-owner @ must be ignored')
ok(classifyReply({ source: 'comment', fromMid: '999', text: '这个插件叫什么', owners }).mode === 'review', 'non-owner low-risk comment must go to review')
ok(classifyReply({ source: 'dm', fromMid: '999', text: '能合作吗', owners }).mode === 'review', 'non-owner low-risk DM must go to review')
ok(classifyReply({ source: 'dm', fromMid: '999', text: '你好呀', owners, knownMids: ['999'] }).mode === 'direct', 'known mutual low-risk DM must be direct in B mode')
ok(classifyReply({ source: 'at', fromMid: '999', text: '你好呀', owners, knownMids: ['999'] }).mode === 'direct', 'known mutual @ must be treated as owner')
ok(classifyReply({ source: 'at', fromMid: '123', text: '今晚看什么', owners }).mode === 'direct', 'owner low-risk must be direct')
ok(classifyReply({ source: 'dm', fromMid: '123', text: '看 https://example.com', owners }).mode === 'confirm', 'owner link must require confirmation')
ok(classifyReply({ source: 'comment', fromMid: '999', text: '转账返利', owners }).mode === 'confirm', 'non-owner sensitive must require confirmation')
const longExam = '19.（本小题满分17分）已知函数f(x)的定义域为R。'.repeat(12)
ok(classifyReply({ source: 'dm', fromMid: '123', text: longExam, owners }).mode === 'direct', 'owner long exam question must be direct, not confirm')
ok(classifyReply({ source: 'dm', fromMid: '999', text: longExam, owners }).mode === 'review', 'non-owner long low-risk DM must be review, not confirm')
ok(classifyReply({ source: 'at', fromMid: '123', text: 'x', owners: { ...owners, activeSource: 'mutual' } }).mode === 'ignore', 'inactive source owner must not be privileged')
ok(classifyReply({ source: 'dm', fromMid: '123', text: 'x', owners: { activeSource: 'manual', members: [{ ...owners.members[0], enabled: false }] } }).mode === 'review', 'disabled owner must not be privileged')

const store = createStore(mkdtempSync(join(tmpdir(), 'ww-policy-')))
store.setOwners({ activeSource: 'manual', members: [{ mid: '123', name: '主人', source: 'manual' }] })
const ignored = store.queueReply({ source: 'at', fromMid: '999', text: '在吗' })
ok(ignored.result.mode === 'ignore' && ignored.item === null, 'non-owner @ must not enter queue')
const reviewed = store.queueReply({ source: 'comment', fromMid: '999', text: '插件叫什么' })
ok(reviewed.result.mode === 'review' && reviewed.item.status === 'pending', 'review reply must be pending')
const direct = store.queueReply({ source: 'dm', fromMid: '123', text: '今晚看什么' })
ok(direct.result.mode === 'direct' && direct.item.status === 'ready', 'owner low-risk must be ready')
const after = store.decideReply(reviewed.item.id, 'approve').value
ok(after.replyQueue.find((item) => item.id === reviewed.item.id)?.status === 'approved', 'reply decision must persist')
let redecide = false
try { store.decideReply(reviewed.item.id, 'reject') } catch (error) { redecide = error?.code === 'bad-request' }
ok(redecide, 'already decided reply must not be flipped')
store.kill()
let killed = false
try { store.queueReply({ source: 'comment', fromMid: '1', text: 'x' }) } catch (error) { killed = error?.code === 'killed' }
ok(killed, 'killed must reject reply queue writes')

if (failures.length > 0) {
  console.error('verify-policy: FAIL')
  for (const failure of failures) console.error(' - ' + failure)
  process.exit(1)
}
console.log('verify-policy: PASS')
console.log(' - non-owner @ ignored; owner direct; links/sensitive confirm; source/enabled respected')
