import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createStore, DEFAULT_SETTINGS } from '../lib/store.js'

const failures = []
function ok(condition, message) {
  if (!condition) failures.push(message)
}

const dir = mkdtempSync(join(tmpdir(), 'ww-store-'))
try {
  const store = createStore(dir)
  const initial = store.getState().value
  ok(initial.pending.length === 0, 'fresh store must not contain demo pending items')
  ok(initial.settings.skipProb === '30%', 'seed settings should contain skipProb=30%')

  const saved = store.setSettings({ skipProb: '35%', dmListen: false })
  ok(saved.value.settings.skipProb === '35%', 'setSettings should persist skipProb')
  ok(saved.value.settings.dmListen === false, 'setSettings should persist dmListen')
  ok(saved.value.logs[0][1] === '保存设置', 'setSettings should append audit')

  let rejected = false
  try { store.setSettings({ unknownKey: 'x' }) } catch { rejected = true }
  ok(rejected, 'unknown setting must be rejected')

  store.setAccount({ mid: '999', name: '测试账号', authenticated: true })
  const queued = store.queueReply({ source: 'dm', fromMid: '123456', text: '测试消息', reply: '测试草稿', msgId: 'm-store-1' })
  ok(queued.item && queued.item.status === 'pending', 'queueReply should create a pending review item')
  ok(queued.item.reply === '测试草稿', 'queueReply should store the draft reply')
  const decided = store.decideReply(queued.item.id, 'approve')
  ok(decided.value.replyQueue.find((item) => item.id === queued.item.id)?.status === 'approved', 'decideReply should approve the item')
  ok(decided.value.logs[0][1] === '回复通过', 'decideReply should append audit')
  const sentApproved = store.sendApprovedReply(queued.item.id)
  ok(sentApproved.ok === true, 'sendApprovedReply should enqueue an approved reply with draft')
  const accountId = sentApproved.state?.value?.account?.mid
  ok(store.listOutbox(accountId).some((item) => item.msgId === 'm-store-1' && item.text === '测试草稿'), 'approved reply draft must be in outbox')

  const noDraft = store.queueReply({ source: 'dm', fromMid: '123456', text: '无草稿消息' })
  store.decideReply(noDraft.item.id, 'approve')
  const blocked = store.sendApprovedReply(noDraft.item.id)
  ok(blocked.ok === false && /draft is empty/.test(blocked.reason), 'approved reply without draft must not enqueue')

  const commentReview = store.queueReply({ source: 'comment', fromMid: '123456', text: '评论审查', reply: '评论草稿', msgId: 'm-comment-1' })
  store.decideReply(commentReview.item.id, 'approve')
  const commentBlocked = store.sendApprovedReply(commentReview.item.id)
  ok(commentBlocked.ok === false && /only DM/.test(commentBlocked.reason), 'comment review must not use the DM sender')

  const reopened = createStore(dir)
  const persisted = reopened.getState().value
  ok(persisted.settings.skipProb === '35%', 'settings must survive reopen')
  ok(persisted.replyQueue.find((item) => item.id === queued.item.id)?.status === 'approved', 'reply queue must survive reopen')

  if (failures.length > 0) {
    console.error('verify-store: FAIL')
    for (const failure of failures) console.error(' - ' + failure)
    process.exit(1)
  }
  console.log('verify-store: PASS')
  console.log(' - seed, settings validation, approval audit, reopen persistence')
} catch (error) {
  console.error('verify-store: FAIL')
  console.error(' - ' + (error?.stack || error))
  process.exit(1)
} finally {
  try { rmSync(dir, { recursive: true, force: true }) } catch {}
}
