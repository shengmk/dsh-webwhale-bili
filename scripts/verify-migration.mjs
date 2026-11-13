import { DatabaseSync } from 'node:sqlite'
import { mkdtempSync, rmSync, writeFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createStore } from '../lib/store.js'

const failures = []
const ok = (condition, message) => { if (!condition) failures.push(message) }
const dirs = []
function tempDir() {
  const dir = mkdtempSync(join(tmpdir(), 'ww-migrate-'))
  dirs.push(dir)
  return dir
}

// Old SQLite: content has no kind column; settings lack newer defaults.
try {
  const dir = tempDir()
  const db = new DatabaseSync(join(dir, 'state.db'))
  db.exec('CREATE TABLE settings (id INTEGER PRIMARY KEY CHECK(id = 1), json TEXT NOT NULL)')
  db.exec("CREATE TABLE content (id TEXT PRIMARY KEY, version INTEGER NOT NULL, title TEXT NOT NULL, script TEXT NOT NULL, state TEXT NOT NULL, updated_at TEXT NOT NULL)")
  db.prepare('INSERT INTO settings (id, json) VALUES (1, ?)').run(JSON.stringify({ autoReply: false, dmListen: true, quietHours: true, persona: 'bili' }))
  db.exec("INSERT INTO content (id, version, title, script, state, updated_at) VALUES ('c-old', 1, '旧稿', '旧脚本', 'draft', '2026-01-01T00:00:00.000Z')")
  db.close()

  const store = createStore(dir)
  const state = store.getState().value
  ok(state.settings.followDailyLimit === '3', 'old settings should merge followDailyLimit default')
  ok(state.settings.autoReply === false, 'old settings keep autoReply')
  const db2 = new DatabaseSync(join(dir, 'state.db'))
  const columns = db2.prepare('PRAGMA table_info(content)').all().map((row) => row.name)
  ok(columns.includes('kind'), 'content table should migrate kind column')
  const row = db2.prepare('SELECT kind,title FROM content WHERE id = ?').get('c-old')
  ok(row?.kind === 'video', 'old content should default to video')
  ok(row?.title === '旧稿', 'old content should be preserved')
  db2.close()
} catch (error) {
  failures.push('sqlite migration threw: ' + (error?.message || error))
}

// Old JSON fallback without newer fields.
try {
  const dir = tempDir()
  writeFileSync(join(dir, 'state.json'), JSON.stringify({
    settings: { autoReply: false, dmListen: true },
    pending: [],
    audit: [],
    content: [],
    approval: [],
    owners: { activeSource: 'manual', members: [] },
    followRequests: [],
  }))
  const store = createStore(dir)
  const state = store.getState().value
  ok(state.settings.followDailyLimit === '3', 'old JSON should merge followDailyLimit')
  ok(Array.isArray(state.computerActions), 'old JSON should expose empty computerActions')
  ok(existsSync(join(dir, 'state.json')), 'JSON fallback file should still exist')
} catch (error) {
  failures.push('json migration threw: ' + (error?.message || error))
}

for (const dir of dirs) { try { rmSync(dir, { recursive: true, force: true }) } catch {} }

if (failures.length > 0) {
  console.error('verify-migration: FAIL')
  for (const failure of failures) console.error(' - ' + failure)
  process.exit(1)
}
console.log('verify-migration: PASS')
console.log(' - old SQLite content kind/defaults preserved; old JSON defaults merged')
