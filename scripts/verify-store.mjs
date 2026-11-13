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
  ok(initial.pending.length === 2, 'seed should contain 2 pending items')
  ok(initial.settings.skipProb === '30%', 'seed settings should contain skipProb=30%')

  const saved = store.setSettings({ skipProb: '35%', dmListen: false })
  ok(saved.value.settings.skipProb === '35%', 'setSettings should persist skipProb')
  ok(saved.value.settings.dmListen === false, 'setSettings should persist dmListen')
  ok(saved.value.logs[0][1] === '保存设置', 'setSettings should append audit')

  let rejected = false
  try { store.setSettings({ unknownKey: 'x' }) } catch { rejected = true }
  ok(rejected, 'unknown setting must be rejected')

  const approved = store.approve('p1')
  ok(approved.value.pending.length === 1, 'approve should remove one pending item')
  ok(approved.value.logs[0][1] === '审批通过', 'approve should append audit')

  const reopened = createStore(dir)
  const persisted = reopened.getState().value
  ok(persisted.settings.skipProb === '35%', 'settings must survive reopen')
  ok(persisted.pending.length === 1, 'pending must survive reopen')

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
