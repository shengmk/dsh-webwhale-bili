import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createStore } from '../lib/store.js'

const failures = []
const ok = (condition, message) => { if (!condition) failures.push(message) }
const dir = mkdtempSync(join(tmpdir(), 'ww-02-'))

try {
  const store = createStore(dir)
  const inbound = { accountId: '100', talkerId: '200', msgId: 'm1', at: 10, text: 'hi' }
  ok(store.claimInbox(inbound) === true, 'first inbox claim must win')
  ok(store.claimInbox(inbound) === false, 'duplicate inbox claim must be rejected')
  ok(store.claimInbox({ ...inbound, msgId: 'm2' }) === true, 'different msg id must be accepted')

  const queued = store.enqueueOutbox({ ...inbound, text: 'hello', nextAt: new Date(0).toISOString() })
  ok(queued.duplicate === false && queued.item, 'first outbox enqueue must create')
  ok(store.enqueueOutbox({ ...inbound, text: 'hello again' }).duplicate === true, 'duplicate outbox enqueue must be rejected')
  ok(store.listOutbox('100').length === 1, 'outbox should contain one row')

  const claimed = store.claimOutbox('100')
  ok(claimed && claimed.text === 'hello', 'outbox claim must return pending text')
  store.completeOutbox(claimed.id, 'sent')
  ok(store.listOutbox('100')[0].status === 'sent', 'outbox must persist sent status')

  const reopened = createStore(dir)
  ok(reopened.claimInbox(inbound) === false, 'inbox idempotency must survive reopen')
  ok(reopened.listOutbox('100')[0].status === 'sent', 'outbox status must survive reopen')

  if (failures.length > 0) {
    console.error('verify-02-runtime: FAIL')
    for (const failure of failures) console.error(' - ' + failure)
    process.exit(1)
  }
  console.log('verify-02-runtime: PASS')
  console.log(' - inbox idempotency + outbox dedupe + reopen persistence')
} catch (error) {
  console.error('verify-02-runtime: FAIL')
  console.error(' - ' + (error?.stack || error))
  process.exit(1)
} finally {
  try { rmSync(dir, { recursive: true, force: true }) } catch {}
}
