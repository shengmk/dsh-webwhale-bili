/**
 * Verify the content + approval + kill-switch state machine against a real store.
 *
 * Covers: draft v1 -> submit -> approve, reject with required reason, stale
 * approvals after an edit, killed write rejection, revive confirmation, the
 * RPC trust route, and reopen persistence.
 */
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { EventEmitter } from 'node:events'
import { createStore } from '../lib/store.js'
import { createRoutes } from '../lib/routes.js'

const failures = []
function ok(condition, message) {
  if (!condition) failures.push(message)
}

function codeOf(fn) {
  try {
    fn()
    return null
  } catch (error) {
    return error?.code || 'unknown'
  }
}

function expectCode(fn, expected, label) {
  const actual = codeOf(fn)
  ok(actual === expected, `${label}: expected ${expected}, got ${actual}`)
}

function callRoute(handler, method, params) {
  return new Promise((resolve, reject) => {
    const req = new EventEmitter()
    req.method = 'POST'
    req.url = '/dsh-webwhale/api/rpc'
    req.destroy = () => {}
    const res = {
      writeHead(status) { this.status = status },
      end(text) {
        try {
          resolve({ status: this.status, body: JSON.parse(text) })
        } catch (error) {
          reject(error)
        }
      },
    }
    Promise.resolve(handler(req, res)).catch(reject)
    setImmediate(() => {
      req.emit('data', Buffer.from(JSON.stringify({ method, params })))
      req.emit('end')
    })
  })
}

const dir = mkdtempSync(join(tmpdir(), 'ww-content-'))
try {
  const store = createStore(dir)
  const initial = store.getState().value
  ok(initial.killed === false, 'kill switch must default to off')
  ok(Array.isArray(initial.contents) && initial.contents.length === 0, 'content table must start empty')
  ok(Array.isArray(initial.approvals) && initial.approvals.length === 0, 'approval table must start empty')

  // A3: create -> draft v1 + audit
  let state = store.createContent({ title: '内容示例', script: '第一版脚本' }).value
  const created = state.contents[0]
  ok(created.version === 1, 'createContent must produce version 1')
  ok(created.state === 'draft', 'createContent must produce draft state')
  ok(created.title === '内容示例' && created.script === '第一版脚本', 'createContent must persist title/script')
  ok(state.logs[0][1] === '新建草稿', 'createContent must append an audit row')

  // Editing is optimistic: a stale version is rejected, a fresh one bumps v+1.
  expectCode(() => store.updateContent({ id: created.id, title: 'x', version: 99 }), 'approval_stale', 'update with stale version')
  state = store.updateContent({ id: created.id, title: '内容示例 v2', script: '第二版脚本', version: 1 }).value
  const updated = state.contents.find((item) => item.id === created.id)
  ok(updated.version === 2, 'updateContent must bump version to 2')
  ok(updated.state === 'draft', 'editing a draft keeps draft state')
  ok(state.logs[0][1] === '更新草稿', 'updateContent must append an audit row')

  // A4: submit binds content_id + version; the approval is pending.
  expectCode(() => store.submitApproval(created.id, 1), 'approval_stale', 'submit with stale version')
  state = store.submitApproval(created.id, 2).value
  const pending = state.contents.find((item) => item.id === created.id)
  ok(pending.state === 'approval_pending', 'submitApproval must move content to approval_pending')
  const approval = state.approvals.find((item) => item.contentId === created.id && item.decision === 'pending')
  ok(approval !== undefined, 'submitApproval must create a pending approval row')
  ok(approval.version === 2, 'approval must bind the submitted version')
  ok(state.logs[0][1] === '提交审批', 'submitApproval must append an audit row')

  // Approve is human-only by construction: actor is always 用户.
  state = store.approveContent(approval.id, 2).value
  const approved = state.contents.find((item) => item.id === created.id)
  const approvedRow = state.approvals.find((item) => item.id === approval.id)
  ok(approved.state === 'approved', 'approveContent must move content to approved')
  ok(approvedRow.decision === 'approved' && approvedRow.actor === '用户', 'approval actor must be fixed to 用户')
  ok(state.logs[0][1] === '审批通过', 'approveContent must append an audit row')

  // A5: reject requires a reason and returns the content to draft.
  state = store.createContent({ title: '驳回示例', script: '脚本' }).value
  const rejectTarget = state.contents.find((item) => item.title === '驳回示例')
  state = store.submitApproval(rejectTarget.id, 1).value
  const rejectApproval = state.approvals.find((item) => item.contentId === rejectTarget.id && item.decision === 'pending')
  expectCode(() => store.rejectContent(rejectApproval.id, '   ', 1), 'bad-request', 'reject without a reason')
  state = store.rejectContent(rejectApproval.id, '口径不对', 1).value
  const rejectedContent = state.contents.find((item) => item.id === rejectTarget.id)
  const rejectedRow = state.approvals.find((item) => item.id === rejectApproval.id)
  ok(rejectedContent.state === 'rejected', 'rejectContent must move content to rejected')
  ok(rejectedRow.decision === 'rejected' && rejectedRow.reason === '口径不对', 'rejectContent must persist the reason')
  ok(rejectedRow.actor === '用户', 'reject actor must be fixed to 用户')
  ok(state.logs[0][1] === '驳回', 'rejectContent must append an audit row')

  // Version invalidation: editing after submit makes the old approval stale.
  state = store.createContent({ title: '失效示例', script: 'v1' }).value
  const staleTarget = state.contents.find((item) => item.title === '失效示例')
  state = store.submitApproval(staleTarget.id, 1).value
  const staleApproval = state.approvals.find((item) => item.contentId === staleTarget.id && item.decision === 'pending')
  state = store.updateContent({ id: staleTarget.id, title: '失效示例 v2', version: 1 }).value
  const bumped = state.contents.find((item) => item.id === staleTarget.id)
  ok(bumped.version === 2 && bumped.state === 'draft', 'edit after submit bumps version and returns to draft')
  const staleRow = state.approvals.find((item) => item.id === staleApproval.id)
  ok(staleRow.decision === 'approval_stale', 'editing must persist the old pending approval as approval_stale')
  expectCode(() => store.approveContent(staleApproval.id), 'approval_stale', 'old approval must be rejected as stale')
  expectCode(() => store.submitApproval(staleTarget.id, 1), 'approval_stale', 'stale submit must be rejected')

  // A6: the kill switch rejects every content/approval write.
  state = store.kill().value
  ok(state.killed === true, 'kill must flip the kill switch')
  ok(state.logs[0][1] === '停机', 'kill must append an audit row')
  expectCode(() => store.createContent({ title: '停机后' }), 'killed', 'create while killed')
  expectCode(() => store.updateContent({ id: staleTarget.id, title: '停机后' }), 'killed', 'update while killed')
  expectCode(() => store.submitApproval(staleTarget.id), 'killed', 'submit while killed')
  expectCode(() => store.approveContent(staleApproval.id), 'killed', 'approve while killed')
  expectCode(() => store.rejectContent(staleApproval.id, '原因'), 'killed', 'reject while killed')
  expectCode(() => store.setSettings({ skipProb: '35%' }), 'killed', 'settings write while killed')
  expectCode(() => store.setAccount({ mid: '1', name: 'x', authenticated: true }), 'killed', 'account write while killed')
  expectCode(() => store.approve('p1'), 'killed', 'reply approval while killed')
  expectCode(() => store.reject('p1'), 'killed', 'reply rejection while killed')
  expectCode(() => store.revive(), 'bad-request', 'revive without confirmation')
  expectCode(() => store.revive('yes'), 'bad-request', 'revive with a wrong confirmation')
  const challenge = store.requestRevive().value.challenge
  expectCode(() => store.revive('REVIVE', 'wrong-challenge'), 'bad-request', 'revive with a wrong challenge')
  state = store.revive('REVIVE', challenge).value
  ok(state.killed === false, 'revive(\'REVIVE\') must clear the kill switch')

  // RPC surface: killed guard covers non-content writes too; revive is the way out.
  const route = createRoutes(store, {
    version: '0.1.0',
    connection: { requestRejection: () => false, admit: () => ({ peer: { principal: { kind: 'owner' } } }) },
    warn: () => {},
  })
  let denied = await callRoute(createRoutes(store, { connection: { requestRejection: () => 401 } }), 'state.get', {})
  ok(denied.status === 401 && denied.body?.error?.code === 'forbidden', 'RPC must fail closed when the trust fence rejects')
  denied = await callRoute(createRoutes(store, {}), 'state.get', {})
  ok(denied.status === 403 && denied.body?.error?.code === 'forbidden', 'RPC must fail closed without a connection')
  const modelRoute = createRoutes(store, {
    connection: { requestRejection: () => false, admit: () => ({ peer: { principal: { kind: 'model' } } }) },
  })
  denied = await callRoute(modelRoute, 'content.create', { title: '模型自批' })
  ok(denied.status === 403 && denied.body?.error?.code === 'forbidden', 'non-owner principal must not mutate state')
  denied = await callRoute(modelRoute, 'auth.qr.cancel', { id: 'fake-session' })
  ok(denied.status === 403 && denied.body?.error?.code === 'forbidden', 'non-owner principal must not cancel QR login')
  const staleRoute = createRoutes(store, {
    connection: { requestRejection: () => false, admit: () => ({ peer: { principal: { kind: 'owner' } } }) },
    isCurrentAccount: () => false,
  })
  denied = await callRoute(staleRoute, 'settings.set', { skipProb: '33%' })
  ok(denied.status === 409 && denied.body?.error?.code === 'bad-request', 'stale account instance must reject writes after switch')
  let response = await callRoute(route, 'content.approve', { id: staleApproval.id })
  ok(response.body?.error?.code === 'approval_stale' && response.status === 409, 'stale approval RPC must return 409 approval_stale')
  store.kill()
  response = await callRoute(route, 'settings.set', { skipProb: '34%' })
  ok(response.body?.error?.code === 'killed', 'RPC settings.set must be killed while stopped')
  response = await callRoute(route, 'auth.qr.poll', { id: 'fake-session' })
  ok(response.body?.error?.code === 'killed' && response.status === 423, 'RPC auth.qr.poll must be killed while stopped')
  response = await callRoute(route, 'auth.qr.cancel', { id: 'fake-session' })
  ok(response.body?.error?.code === 'killed' && response.status === 423, 'RPC auth.qr.cancel must be killed while stopped')
  response = await callRoute(route, 'pending.approve', { id: 'p1' })
  ok(response.body?.error?.code === 'killed', 'RPC pending.approve must be killed while stopped')
  response = await callRoute(route, 'content.create', { title: 'RPC 停机' })
  ok(response.body?.error?.code === 'killed', 'RPC content.create must be killed while stopped')
  response = await callRoute(route, 'risk.revive.request', {})
  const rpcChallenge = response.body?.value?.challenge
  ok(typeof rpcChallenge === 'string' && rpcChallenge.length > 0, 'RPC risk.revive.request must issue a challenge')
  response = await callRoute(route, 'risk.revive.confirm', { confirm: 'REVIVE', challenge: 'wrong' })
  ok(response.body?.error?.code === 'bad-request', 'RPC risk.revive.confirm must reject a wrong challenge')
  response = await callRoute(route, 'risk.revive.confirm', { confirm: 'REVIVE', challenge: rpcChallenge })
  ok(response.body?.ok === true && response.body.value.killed === false, 'RPC risk.revive.confirm must clear the switch')
  response = await callRoute(route, 'content.create', { title: 'RPC 草稿', script: 'rpc' })
  ok(response.body?.ok === true, 'RPC content.create must work after revive')
  const createdId = response.body.value.contents.find((item) => item.title === 'RPC 草稿')?.id
  ok(typeof createdId === 'string', 'RPC content.create must return the new content')
  response = await callRoute(route, 'content.submit', { id: createdId, version: 1 })
  ok(response.body?.ok === true, 'RPC content.submit must be available')
  const rpcApproval = response.body.value.approvals.find((item) => item.contentId === createdId && item.decision === 'pending')
  response = await callRoute(route, 'content.reject', { id: rpcApproval.id, reason: 'RPC 驳回原因', version: 1 })
  ok(response.body?.ok === true, 'RPC content.reject must be available')
  ok(response.body.value.logs[0][1] === '驳回', 'RPC content.reject must append an audit row')
  response = await callRoute(route, 'content.update', { id: createdId, title: 'RPC 草稿 v2', version: 1 })
  ok(response.body?.ok === true, 'RPC content.update must be available')
  ok(response.body.value.contents.find((item) => item.id === createdId)?.version === 2, 'RPC content.update must bump the version')
  response = await callRoute(route, 'content.submit', { id: createdId, version: 2 })
  ok(response.body?.ok === true, 'RPC content.submit must accept the new version')
  const rpcApproval2 = response.body.value.approvals.find((item) => item.contentId === createdId && item.decision === 'pending')
  response = await callRoute(route, 'content.approve', { id: rpcApproval2.id, version: 2 })
  ok(response.body?.ok === true, 'RPC content.approve must be available')
  ok(response.body.value.approvals.find((item) => item.id === rpcApproval2.id)?.actor === '用户', 'RPC approval actor must be 用户')

  // Persistence: content/approval/killed/audit survive a reopen.
  const beforeClose = store.getState().value
  store.kill()
  const reopened = createStore(dir)
  const persisted = reopened.getState().value
  ok(persisted.killed === true, 'killed flag must survive reopen')
  ok(persisted.contents.length === beforeClose.contents.length, 'contents must survive reopen')
  ok(persisted.approvals.length === beforeClose.approvals.length, 'approvals must survive reopen')
  ok(persisted.contents.find((item) => item.id === rejectTarget.id)?.state === 'rejected', 'rejected content must survive reopen')
  ok(persisted.approvals.find((item) => item.id === staleApproval.id)?.decision === 'approval_stale', 'approval_stale must survive reopen')
  ok(persisted.logs.some((row) => row[1] === '唤醒'), 'seed audit must survive reopen (append-only)')
  ok(typeof reopened.deleteAudit === 'undefined' && typeof reopened.updateAudit === 'undefined', 'audit must expose no mutation API')
  reopened.revive('REVIVE', reopened.requestRevive().value.challenge)

  if (failures.length > 0) {
    console.error('verify-content: FAIL')
    for (const failure of failures) console.error(' - ' + failure)
    process.exit(1)
  }
  console.log('verify-content: PASS')
  console.log(' - state machine: draft v1 -> v2 -> approval_pending -> approved')
  console.log(' - reject requires reason -> rejected; old approval is approval_stale')
  console.log(' - killed rejects content/approval/auth writes; revive needs a server challenge')
  console.log(' - RPC content.* / risk.kill / risk.revive.* + owner-only writes')
} catch (error) {
  console.error('verify-content: FAIL')
  console.error(' - ' + (error?.stack || error))
  process.exit(1)
} finally {
  try { rmSync(dir, { recursive: true, force: true }) } catch {}
}
