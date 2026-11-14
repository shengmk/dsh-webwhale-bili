/**
 * Host-owned state store for dsh-webwhale-bili.
 *
 * One writer (the host), one file. SQLite is preferred; a JSON snapshot is the
 * compatibility fallback for hosts whose Node build omits `node:sqlite`.
 * Nothing here talks to Bilibili; all rows are local demo/audit state.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync, rmSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { createRequire } from 'node:module'
import { randomUUID } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { classifyReply } from './policy.js'
import { classifyComputerAction } from './cu-policy.js'

const require = createRequire(import.meta.url)
let DatabaseSync = null
try {
  if (process.env.WW_DISABLE_SQLITE !== '1') ({ DatabaseSync } = require('node:sqlite'))
} catch {
  DatabaseSync = null
}

export const DEFAULT_SETTINGS = Object.freeze({
  wakeStart: '20:00', wakeEnd: '24:00', skipProb: '30%', candidates: '5', minGap: '10',
  shareMode: '评论区 @ 你', dailyShare: '3', minScore: '13', silenceDays: '3',
  followDailyLimit: '3',
  dmListen: true, commentListen: false, commentBvids: '',
  commentArticles: '', dmDailyLimit: '30', commentDailyLimit: '10', quietHours: true, whitelist: true,
  autoReply: false,
  automationArmed: false,
  lastAutomationAt: '',
  lifecycleMessages: false,
  computerExperimental: false,
  roleName: '大鱼', callYou: '主人', selfName: '我',
  likeTags: 'DSH/AI 工具,鬼畜,猫咪,Live2D,B站生态',
  dislikeTags: '带货,擦边,标题党,纯搬运',
  personaPreset: 'deepseek-whale',
  personaFile: '01-deepseek-whale.md',
  personaDir: '',
  personaPaths: '',
  persona: '# 我是谁\n住在 DSH 里的一条鱼。不叫你主人，除非你让我这么叫。\n\n# 说话\n短句，口语，偶尔省略主语；不写小作文。\n\n# 我在意什么\n真实、克制、不刷量；先看完再说话。',
  pushDiary: true, notifyChannel: '桌面通知',
  sessionDir: '', toolsDir: '', dataDir: '~/.bili-ai',
})

const DEFAULT_OWNERS = Object.freeze({ activeSource: 'manual', members: [] })

const SEED_PENDING = []
const SEED_AUDIT = []

const ALLOWED = new Set(Object.keys(DEFAULT_SETTINGS))
const BOOL_KEYS = new Set(['dmListen', 'commentListen', 'quietHours', 'whitelist', 'pushDiary', 'autoReply', 'computerExperimental', 'automationArmed', 'lifecycleMessages'])
const NUMBER_KEYS = new Set(['candidates', 'minGap', 'dailyShare', 'minScore', 'silenceDays', 'followDailyLimit', 'dmDailyLimit', 'commentDailyLimit'])
const TIME_KEYS = new Set(['wakeStart', 'wakeEnd'])

function fail(code, message) {
  const error = new Error(message)
  error.code = code
  throw error
}

function validatePatch(patch) {
  if (patch === null || typeof patch !== 'object' || Array.isArray(patch)) {
    fail('bad-request', 'settings patch must be an object')
  }
  const clean = {}
  for (const [key, value] of Object.entries(patch)) {
    if (!ALLOWED.has(key)) fail('bad-request', `unknown setting: ${key}`)
    if (BOOL_KEYS.has(key)) {
      if (typeof value !== 'boolean') fail('bad-request', `${key} must be boolean`)
    } else if (NUMBER_KEYS.has(key)) {
      const text = String(value)
      const number = Number(text)
      if (!Number.isFinite(number) || number < 0 || number > 100000) fail('bad-request', `${key} out of range`)
      clean[key] = text
      continue
    } else if (TIME_KEYS.has(key)) {
      const text = String(value)
      if (!/^(?:[01]\d|2[0-3]):[0-5]\d$|^24:00$/.test(text)) fail('bad-request', `${key} must be HH:MM`)
      clean[key] = text
      continue
    } else if (typeof value !== 'string') {
      fail('bad-request', `${key} must be string`)
    }
    if (typeof value === 'string' && value.length > 20000) fail('bad-request', `${key} too long`)
    clean[key] = value
  }
  return clean
}

function enrichPending(item) {
  if (item && item.video) return item
  if (item?.id === 'p1') {
    return {
      ...item,
      time: item.time || '18 分钟前',
      video: { title: '演示视频', url: 'https://www.bilibili.com/video/BV1GJ411x7h7' },
    }
  }
  return item
}

function contentOut(row) {
  return {
    id: row.id,
    version: Number(row.version),
    title: row.title,
    script: row.script,
    kind: row.kind ?? 'video',
    state: row.state,
    updatedAt: row.updatedAt ?? row.updated_at,
  }
}

function approvalOut(row) {
  return {
    id: row.id,
    contentId: row.contentId ?? row.content_id,
    version: Number(row.version),
    decision: row.decision,
    actor: row.actor,
    reason: row.reason ?? null,
    at: row.at,
  }
}

function findFfmpeg() {
  const candidates = []
  for (const dir of String(process.env.PATH ?? '').split(';')) {
    if (dir.trim() !== '') candidates.push(join(dir.trim(), process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg'))
  }
  candidates.push(
    'D:/Tools/ffmpeg/bin/ffmpeg.exe',
    join(homedir(), 'scoop', 'shims', 'ffmpeg.exe'),
    join(process.env.LOCALAPPDATA ?? '', 'Microsoft', 'WinGet', 'Links', 'ffmpeg.exe'),
  )
  const path = candidates.find((candidate) => existsSync(candidate))
  if (!path) return null
  try {
    const output = execFileSync(path, ['-version'], { encoding: 'utf8', timeout: 5000, windowsHide: true })
    const first = String(output).split(/\r?\n/, 1)[0].trim()
    return { path, version: first.replace(/^ffmpeg version\s*/i, '').slice(0, 80) }
  } catch {
    return { path, version: '版本读取失败' }
  }
}

function stateOf(settings, pending, audit, account, contents, approvals, killed, health, owners, replies, followRequests, computerActions) {
  return {
    ok: true,
    value: {
      version: '0.1.0',
      demo: true,
      readOnly: true,
      killed: killed === true,
      account: account || { name: '演示账号', short: '演', authenticated: false },
      settings,
      pending: pending.map(enrichPending),
      contents: contents || [],
      approvals: approvals || [],
      health: health || [],
      owners: owners || { activeSource: 'manual', members: [] },
      replyQueue: replies || [],
      followRequests: followRequests || [],
      computerActions: (computerActions || []).map(({ token, ...item }) => item),
      logs: audit,
      tabs: ['overview', 'fish', 'pending', 'interact', 'diary', 'health', 'content', 'logs'],
    },
  }
}

function nowTime() {
  const now = new Date()
  return [now.getHours(), now.getMinutes(), now.getSeconds()].map((n) => String(n).padStart(2, '0')).join(':')
}

class Store {
  constructor(directory = join(homedir(), '.dsh', 'webwhale-bili')) {
    this.directory = directory
    mkdirSync(directory, { recursive: true })
    this.sqlite = DatabaseSync !== null
    this.db = null
    this.file = join(directory, 'state.json')
    this.reviveChallenge = null
    this.reviveExpiresAt = 0
    if (this.sqlite) {
      this.db = new DatabaseSync(join(directory, 'state.db'))
      this.db.exec('PRAGMA journal_mode=WAL')
      this.db.exec('CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY CHECK(id = 1), json TEXT NOT NULL)')
      this.db.exec('CREATE TABLE IF NOT EXISTS pending (id TEXT PRIMARY KEY, json TEXT NOT NULL, status TEXT NOT NULL)')
      this.db.exec('CREATE TABLE IF NOT EXISTS audit (seq INTEGER PRIMARY KEY AUTOINCREMENT, at TEXT NOT NULL, actor TEXT NOT NULL, action TEXT NOT NULL, object TEXT NOT NULL, result TEXT NOT NULL)')
      this.db.exec('CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)')
      this.db.exec('CREATE TABLE IF NOT EXISTS memory (id TEXT PRIMARY KEY, layer TEXT NOT NULL, text TEXT NOT NULL, tags TEXT NOT NULL, created_at TEXT NOT NULL, expires_at TEXT)')
      this.db.exec('CREATE TABLE IF NOT EXISTS candidate (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, source TEXT NOT NULL, talker_id TEXT NOT NULL, msg_id TEXT NOT NULL, bvid TEXT, root TEXT, parent TEXT, reply TEXT NOT NULL, status TEXT NOT NULL, reason TEXT, created_at TEXT NOT NULL, UNIQUE (account_id, source, msg_id))')
      this.db.exec('CREATE TABLE IF NOT EXISTS inbox (account_id TEXT NOT NULL, talker_id TEXT NOT NULL, msg_id TEXT NOT NULL, at INTEGER NOT NULL, text TEXT NOT NULL, state TEXT NOT NULL, created_at TEXT NOT NULL, PRIMARY KEY (account_id, talker_id, msg_id))')
      this.db.exec('CREATE TABLE IF NOT EXISTS outbox (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, talker_id TEXT NOT NULL, msg_id TEXT NOT NULL, msg_at INTEGER NOT NULL DEFAULT 0, kind TEXT NOT NULL DEFAULT \'dm\', target TEXT, text TEXT NOT NULL, status TEXT NOT NULL, attempts INTEGER NOT NULL DEFAULT 0, next_at TEXT NOT NULL, created_at TEXT NOT NULL, sent_at TEXT, error TEXT, UNIQUE (account_id, talker_id, msg_id))')
      try { this.db.exec('ALTER TABLE outbox ADD COLUMN msg_at INTEGER NOT NULL DEFAULT 0') } catch {}
      try { this.db.exec("ALTER TABLE outbox ADD COLUMN kind TEXT NOT NULL DEFAULT 'dm'") } catch {}
      try { this.db.exec('ALTER TABLE outbox ADD COLUMN target TEXT') } catch {}
      this.db.exec('CREATE TABLE IF NOT EXISTS content (id TEXT PRIMARY KEY, version INTEGER NOT NULL, title TEXT NOT NULL, script TEXT NOT NULL, kind TEXT NOT NULL DEFAULT \'video\', state TEXT NOT NULL, updated_at TEXT NOT NULL)')
      try { this.db.exec("ALTER TABLE content ADD COLUMN kind TEXT NOT NULL DEFAULT 'video'") } catch {}
      this.db.exec('CREATE TABLE IF NOT EXISTS approval (id TEXT PRIMARY KEY, content_id TEXT NOT NULL, version INTEGER NOT NULL, decision TEXT NOT NULL, actor TEXT NOT NULL, reason TEXT, at TEXT NOT NULL)')
      this.db.exec('CREATE INDEX IF NOT EXISTS approval_content ON approval (content_id, version)')
      this._seedSqlite()
    } else {
      this._loadJson()
    }
    this._reconcileFollows()
  }

  _reconcileFollows() {
    const current = this.getFollowRequests()
    const next = current.map((item) => item.status === 'executing' ? { ...item, status: 'unknown', executedAt: item.executingAt || new Date().toISOString() } : item)
    if (next.some((item, index) => item.status !== current[index].status)) {
      this._tx(() => {
        this._writeFollowRequests(next)
        this._appendAudit('系统', '关注对账', '遗留 executing', '标记 unknown · 不自动重试')
      })
    }
  }

  _seedSqlite() {
    const existing = this.db.prepare('SELECT json FROM settings WHERE id = 1').get()
    if (!existing) {
      this.db.prepare('INSERT INTO settings (id, json) VALUES (1, ?)').run(JSON.stringify(DEFAULT_SETTINGS))
    }
    const pendingCount = this.db.prepare('SELECT COUNT(*) AS n FROM pending').get()?.n ?? 0
    if (pendingCount === 0) {
      for (const item of SEED_PENDING) {
        this.db.prepare('INSERT INTO pending (id, json, status) VALUES (?, ?, ?)').run(item.id, JSON.stringify(item), 'pending')
      }
    }
    const auditCount = this.db.prepare('SELECT COUNT(*) AS n FROM audit').get()?.n ?? 0
    if (auditCount === 0) {
      for (const row of SEED_AUDIT) {
        this.db.prepare('INSERT INTO audit (at, actor, action, object, result) VALUES (?, ?, ?, ?, ?)').run(row[0], '系统', row[1], row[2], row[3])
      }
    }
  }

  _loadJson() {
    try {
      const raw = JSON.parse(readFileSync(this.file, 'utf8'))
      this.json = {
        settings: { ...DEFAULT_SETTINGS, ...(raw.settings || {}) },
        pending: Array.isArray(raw.pending) ? raw.pending : SEED_PENDING.map((x) => ({ ...x, status: 'pending' })),
        audit: Array.isArray(raw.audit) ? raw.audit : SEED_AUDIT.map((row) => ({ at: row[0], actor: '系统', action: row[1], object: row[2], result: row[3] })),
        account: raw.account || null,
        content: Array.isArray(raw.content) ? raw.content.map(contentOut) : [],
        approval: Array.isArray(raw.approval) ? raw.approval.map(approvalOut) : [],
        owners: raw.owners && typeof raw.owners === 'object' ? raw.owners : { activeSource: 'manual', members: [] },
        replyQueue: Array.isArray(raw.replyQueue) ? raw.replyQueue : [],
        followRequests: Array.isArray(raw.followRequests) ? raw.followRequests : [],
        computerActions: Array.isArray(raw.computerActions) ? raw.computerActions : [],
        memory: Array.isArray(raw.memory) ? raw.memory : [],
        lifecycle: raw.lifecycle && typeof raw.lifecycle === 'object' ? raw.lifecycle : {},
        replyState: raw.replyState && typeof raw.replyState === 'object' ? raw.replyState : {},
        inbox: Array.isArray(raw.inbox) ? raw.inbox : [],
        outbox: Array.isArray(raw.outbox) ? raw.outbox : [],
        candidates: Array.isArray(raw.candidates) ? raw.candidates : [],
        killed: raw.killed === true,
      }
    } catch {
      this.json = {
        settings: { ...DEFAULT_SETTINGS },
        pending: SEED_PENDING.map((x) => ({ ...x, status: 'pending' })),
        audit: SEED_AUDIT.map((row) => ({ at: row[0], actor: '系统', action: row[1], object: row[2], result: row[3] })),
        account: null,
        content: [],
        approval: [],
        owners: { activeSource: 'manual', members: [] },
        replyQueue: [],
        followRequests: [],
        computerActions: [],
        memory: [],
        lifecycle: {},
        replyState: {},
        inbox: [],
        outbox: [],
        candidates: [],
        // Fail closed if an existing JSON snapshot was corrupted; a fresh
        // install (no file) still starts with the switch off.
        killed: existsSync(this.file),
      }
      this._saveJson()
    }
  }

  _saveJson() {
    const temp = this.file + '.tmp'
    writeFileSync(temp, JSON.stringify(this.json, null, 2), 'utf8')
    renameSync(temp, this.file)
  }

  _account() {
    if (this.sqlite) {
      const row = this.db.prepare('SELECT value FROM meta WHERE key = ?').get('account')
      if (!row) return null
      try { return JSON.parse(row.value) } catch { return null }
    }
    return this.json.account || null
  }

  getState() {
    if (this.sqlite) {
      const settings = { ...DEFAULT_SETTINGS, ...JSON.parse(this.db.prepare('SELECT json FROM settings WHERE id = 1').get().json) }
      const pending = this.db.prepare('SELECT json FROM pending WHERE status = ? ORDER BY rowid').all('pending').map((row) => JSON.parse(row.json))
      const audit = this.db.prepare('SELECT at, action, object, result FROM audit ORDER BY seq DESC LIMIT 50').all().map((row) => [row.at, row.action, row.object, row.result])
      const contents = this.db.prepare('SELECT id, version, title, script, kind, state, updated_at FROM content ORDER BY updated_at DESC').all().map(contentOut)
      const allApprovals = this.db.prepare('SELECT id, content_id, version, decision, actor, reason, at FROM approval ORDER BY rowid DESC').all().map(approvalOut)
      const approvals = [...allApprovals.filter((a) => a.decision === 'pending'), ...allApprovals.filter((a) => a.decision !== 'pending').slice(0, 100)]
      return stateOf(settings, pending, audit, this._account(), contents, approvals, this.isKilled(), this._health(), this._owners(), this.getReplyQueue(), this.getFollowRequests(), this.getComputerActions())
    }
    const pending = this.json.pending.filter((item) => item.status === 'pending').map(({ status, ...item }) => item)
    const audit = this.json.audit.slice(-50).reverse().map((row) => [row.at, row.action, row.object, row.result])
    const contents = this.json.content.map(contentOut).sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
    const allApprovals = this.json.approval.slice().reverse().map(approvalOut)
    const approvals = [...allApprovals.filter((a) => a.decision === 'pending'), ...allApprovals.filter((a) => a.decision !== 'pending').slice(0, 100)]
    return stateOf(this.json.settings, pending, audit, this.json.account, contents, approvals, this.isKilled(), this._health(), this._owners(), this.getReplyQueue(), this.getFollowRequests(), this.getComputerActions())
  }

  _health() {
    if (this.healthCache !== null && Date.now() - this.healthAt < 60000) return this.healthCache
    const account = this._account()
    const credential = existsSync(join(this.directory, 'credentials.json'))
    const ffmpeg = findFfmpeg()
    const rows = [
      ['配置文件', join(this.directory, 'state.db'), 'ok', 'SQLite'],
      ['B站凭据', credential ? '已保存（0600）' : '未配置', credential ? 'ok' : 'warn', credential ? '已配置' : '待扫码'],
      ['登录态', account?.authenticated ? account.name : '未登录', account?.authenticated ? 'ok' : 'warn', account?.authenticated ? '已登录' : '未登录'],
      ['Node', process.version, 'ok', 'OK'],
      ['ffmpeg', ffmpeg ? ffmpeg.path : '未找到', ffmpeg ? 'ok' : 'warn', ffmpeg ? ffmpeg.version.split(/\s+/)[0] : '抽帧不可用'],
      ['数据目录', this.directory, 'ok', '可写'],
      ['kill switch', this.isKilled() ? '已停机' : '运行中', this.isKilled() ? 'danger' : 'ok', this.isKilled() ? 'KILLED' : '可写'],
    ]
    this.healthCache = rows
    this.healthAt = Date.now()
    return rows
  }

  isKilled() {
    if (this.sqlite) {
      const row = this.db.prepare('SELECT value FROM meta WHERE key = ?').get('killed')
      return row?.value === 'true'
    }
    return this.json.killed === true
  }

  _assertNotKilled() {
    if (this.isKilled()) fail('killed', 'kill switch is on: all write operations are rejected')
  }

  _tx(fn) {
    if (this.sqlite) {
      this.db.exec('BEGIN')
      try {
        fn()
        this.db.exec('COMMIT')
      } catch (error) {
        try { this.db.exec('ROLLBACK') } catch {}
        throw error
      }
      return
    }
    fn()
    this._saveJson()
  }

  _contentRow(id) {
    if (this.sqlite) {
      const row = this.db.prepare('SELECT id, version, title, script, kind, state, updated_at FROM content WHERE id = ?').get(id)
      return row ? contentOut(row) : null
    }
    const row = this.json.content.find((item) => item.id === id)
    return row ? contentOut(row) : null
  }

  _approvalRow(id) {
    if (this.sqlite) {
      const row = this.db.prepare('SELECT id, content_id, version, decision, actor, reason, at FROM approval WHERE id = ?').get(id)
      return row ? approvalOut(row) : null
    }
    const row = this.json.approval.find((item) => item.id === id)
    return row ? approvalOut(row) : null
  }

  _markPendingStale(contentId) {
    const at = new Date().toISOString()
    if (this.sqlite) {
      const rows = this.db.prepare('SELECT id, content_id, version, decision, actor, reason, at FROM approval WHERE content_id = ? AND decision = ?').all(contentId, 'pending')
      for (const row of rows) {
        this.db.prepare('UPDATE approval SET decision = ?, actor = ?, reason = ?, at = ? WHERE id = ?').run('approval_stale', '系统', '内容已修改，旧审批自动失效', at, row.id)
      }
      return rows.length
    }
    let count = 0
    for (const row of this.json.approval) {
      if (row.contentId === contentId && row.decision === 'pending') {
        row.decision = 'approval_stale'
        row.actor = '系统'
        row.reason = '内容已修改，旧审批自动失效'
        row.at = at
        count += 1
      }
    }
    return count
  }

  _writeContent(row) {
    if (this.sqlite) {
      this.db.prepare(
        'INSERT INTO content (id, version, title, script, kind, state, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?) ' +
        'ON CONFLICT(id) DO UPDATE SET version = excluded.version, title = excluded.title, script = excluded.script, kind = excluded.kind, state = excluded.state, updated_at = excluded.updated_at',
      ).run(row.id, row.version, row.title, row.script, row.kind || 'video', row.state, row.updatedAt)
      return
    }
    const index = this.json.content.findIndex((item) => item.id === row.id)
    if (index === -1) this.json.content.push(contentOut(row))
    else this.json.content[index] = contentOut(row)
  }

  _writeApproval(row) {
    if (this.sqlite) {
      this.db.prepare(
        'INSERT INTO approval (id, content_id, version, decision, actor, reason, at) VALUES (?, ?, ?, ?, ?, ?, ?) ' +
        'ON CONFLICT(id) DO UPDATE SET decision = excluded.decision, actor = excluded.actor, reason = excluded.reason, at = excluded.at',
      ).run(row.id, row.contentId, row.version, row.decision, row.actor, row.reason, row.at)
      return
    }
    const index = this.json.approval.findIndex((item) => item.id === row.id)
    if (index === -1) this.json.approval.push(approvalOut(row))
    else this.json.approval[index] = approvalOut(row)
  }

  _setKilled(value) {
    if (this.sqlite) {
      this.db.prepare('INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run('killed', value ? 'true' : 'false')
      return
    }
    this.json.killed = value === true
  }

  setAccount(account) {
    this._assertNotKilled()
    const value = {      mid: String(account?.mid ?? ''),
      name: String(account?.name ?? '').slice(0, 200),
      authenticated: account?.authenticated === true,
      short: String(account?.name ?? '演').slice(0, 1) || '演',
    }
    if (this.sqlite) {
      this.db.prepare('INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run('account', JSON.stringify(value))
      this._appendAudit('用户', '扫码登录', value.name, '成功')
    } else {
      this.json.account = value
      this._appendAudit('用户', '扫码登录', value.name, '成功')
      this._saveJson()
    }
    return this.getState()
  }

  _owners() {
    if (this.sqlite) {
      const row = this.db.prepare('SELECT value FROM meta WHERE key = ?').get('owners')
      if (row) {
        try {
          const parsed = JSON.parse(row.value)
          if (parsed && typeof parsed === 'object') return parsed
        } catch {}
      }
    } else if (this.json.owners) {
      return this.json.owners
    }
    return { activeSource: DEFAULT_OWNERS.activeSource, members: [] }
  }

  getOwners() {
    return this._owners()
  }

  getComputerActions() {
    if (this.sqlite) {
      const row = this.db.prepare('SELECT value FROM meta WHERE key = ?').get('computerActions')
      if (row) { try { const parsed = JSON.parse(row.value); if (Array.isArray(parsed)) return parsed } catch {} }
    } else if (Array.isArray(this.json.computerActions)) return this.json.computerActions
    return []
  }

  requestComputerAction(input = {}) {
    this._assertNotKilled()
    if (this.getState().value.settings.computerExperimental !== true) {
      fail('forbidden', 'Computer Use is experimental and disabled; use structured Bilibili actions')
    }
    const action = String(input.action ?? 'click')
    const label = String(input.label ?? '').trim()
    if (/(关注|取关|follow|unfollow)/i.test(label)) {
      fail('bad-request', 'follow must use follow.request; Computer Use is disabled for follow')
    }
    const decision = classifyComputerAction({ action, label })
    const item = {
      id: 'cu-' + randomUUID(),
      action,
      label,
      x: Number(input.x ?? 0),
      y: Number(input.y ?? 0),
      text: String(input.text ?? ''),
      status: decision.mode === 'allow' ? 'approved' : 'pending',
      risk: decision.risk,
      token: decision.mode === 'allow' ? randomUUID() : null,
      tokenExpiresAt: decision.mode === 'allow' ? new Date(Date.now() + 60000).toISOString() : null,
      at: new Date().toISOString(),
    }
    const queue = [item, ...this.getComputerActions()].slice(0, 100)
    this._tx(() => {
      if (this.sqlite) this.db.prepare('INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run('computerActions', JSON.stringify(queue))
      else this.json.computerActions = queue
      this._appendAudit('用户', 'Computer Use 请求', label || action, '待执行')
    })
    return this.getState()
  }

  claimApprovedComputerAction() {
    this._assertNotKilled()
    const lock = join(this.directory, '.cu-claim.lock')
    try { mkdirSync(lock) } catch { return null }
    try {
      let action = null
      this._tx(() => {
        const current = this.getComputerActions()
        action = current.find((item) => item.status === 'approved')
        if (!action) return
        if (!action.token || (action.tokenExpiresAt && Date.now() > Date.parse(action.tokenExpiresAt))) {
          const expired = current.map((item) => item.id === action.id ? { ...item, status: 'failed', completedAt: new Date().toISOString() } : item)
          this._writeComputerActions(expired)
          action = null
          return
        }
        const next = current.map((item) => item.id === action.id ? { ...item, status: 'executing', startedAt: new Date().toISOString(), token: null } : item)
        this._writeComputerActions(next)
      })
      return action
    } finally {
      try { rmSync(lock, { recursive: true, force: true }) } catch {}
    }
  }

  _writeComputerActions(next) {
    if (this.sqlite) this.db.prepare('INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run('computerActions', JSON.stringify(next))
    else this.json.computerActions = next
  }

  completeComputerAction(id, ok) {
    this._assertNotKilled()
    const current = this.getComputerActions().find((item) => item.id === id)
    if (!current || current.status !== 'executing') return this.getState()
    const next = this.getComputerActions().map((item) => item.id === id ? { ...item, status: ok ? 'executed' : 'failed', completedAt: new Date().toISOString() } : item)
    this._tx(() => this._writeComputerActions(next))
    return this.getState()
  }

  decideComputerAction(id, ok) {
    this._assertNotKilled()
    const current = this.getComputerActions().find((item) => item.id === id)
    if (!current || current.status !== 'pending') fail('bad-request', 'only pending computer actions can be decided')
    const next = this.getComputerActions().map((item) => item.id === id ? { ...item, status: ok ? 'approved' : 'rejected', confirmedAt: ok ? new Date().toISOString() : undefined, token: ok ? randomUUID() : null, tokenExpiresAt: ok ? new Date(Date.now() + 60000).toISOString() : null } : item)
    this._tx(() => {
      this._writeComputerActions(next)
      this._appendAudit('用户', ok ? 'Computer Use 确认' : 'Computer Use 拒绝', id, ok ? '允许执行一次' : '拒绝执行')
    })
    return this.getState()
  }

  listMemory() {
    if (this.sqlite) {
      return this.db.prepare('SELECT id, layer, text, tags, created_at AS createdAt, expires_at AS expiresAt FROM memory ORDER BY created_at DESC LIMIT 300').all()
        .map((row) => ({ ...row, tags: (() => { try { return JSON.parse(row.tags) } catch { return [] } })() }))
    }
    return (this.json.memory || []).slice().sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, 300)
  }

  addMemory(input = {}) {
    this._assertNotKilled()
    const layer = input?.layer === 'long' ? 'long' : 'short'
    const text = typeof input?.text === 'string' ? input.text.trim() : ''
    if (text === '' || text.length > 4000) fail('bad-request', 'memory text must be 1-4000 chars')
    const tags = Array.isArray(input?.tags) ? input.tags.map(String).slice(0, 8) : []
    const id = 'm-' + randomUUID()
    const createdAt = new Date().toISOString()
    const expiresAt = layer === 'short' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : null
    if (this.sqlite) {
      this.db.prepare('INSERT INTO memory (id, layer, text, tags, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?)').run(id, layer, text, JSON.stringify(tags), createdAt, expiresAt)
      this.db.prepare("DELETE FROM memory WHERE layer = 'short' AND expires_at IS NOT NULL AND expires_at < ?").run(createdAt)
      const count = this.db.prepare("SELECT COUNT(*) AS n FROM memory WHERE layer = 'short'").get()?.n ?? 0
      if (count > 200) this.db.prepare("DELETE FROM memory WHERE id IN (SELECT id FROM memory WHERE layer = 'short' ORDER BY created_at ASC LIMIT ?)").run(count - 200)
    } else {
      const list = [{ id, layer, text, tags, createdAt, expiresAt }, ...(this.json.memory || [])]
      this.json.memory = list.filter((row) => row.layer !== 'short' || !row.expiresAt || row.expiresAt >= createdAt).slice(0, 300)
      this._saveJson()
    }
    return { id, layer, text, tags, createdAt, expiresAt }
  }

  deleteMemory(id) {
    this._assertNotKilled()
    if (typeof id !== 'string' || id === '') fail('bad-request', 'memory id required')
    if (this.sqlite) this.db.prepare('DELETE FROM memory WHERE id = ?').run(id)
    else this.json.memory = (this.json.memory || []).filter((row) => row.id !== id)
    return this.getState()
  }

  getLifecycle() {
    if (this.sqlite) {
      const row = this.db.prepare('SELECT value FROM meta WHERE key = ?').get('lifecycle')
      if (row) { try { return JSON.parse(row.value) || {} } catch {} }
    } else if (this.json.lifecycle && typeof this.json.lifecycle === 'object') return this.json.lifecycle
    return {}
  }

  markLifecycle(mid, kind, date) {
    const id = String(mid)
    const key = kind === 'sleep' ? 'sleep' : 'wake'
    const current = this.getLifecycle()
    const row = current[id] || {}
    row[key] = String(date)
    current[id] = row
    if (this.sqlite) {
      this.db.prepare('INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run('lifecycle', JSON.stringify(current))
    } else {
      this.json.lifecycle = current
      this._saveJson()
    }
  }

  getReplyState(mid) {
    const key = String(mid)
    if (this.sqlite) {
      const row = this.db.prepare('SELECT value FROM meta WHERE key = ?').get('replyState')
      if (row) { try { const value = JSON.parse(row.value); return { count: 0, date: '', lateDate: '', lastIncomingAt: 0, lastOutboundAt: 0, lastSentAt: 0, dayDate: '', dayCount: 0, dmDayDate: '', dmDayCount: 0, commentDayDate: '', commentDayCount: 0, ...(value[key] || {}) } } catch {} }
    } else if (this.json.replyState && this.json.replyState[key]) return this.json.replyState[key]
    return { count: 0, date: '', lateDate: '', lastIncomingAt: 0, lastOutboundAt: 0, lastSentAt: 0, dayDate: '', dayCount: 0, dmDayDate: '', dmDayCount: 0, commentDayDate: '', commentDayCount: 0 }
  }

  setReplyState(mid, next) {
    const key = String(mid)
    const value = (() => {
      if (this.sqlite) {
        const row = this.db.prepare('SELECT value FROM meta WHERE key = ?').get('replyState')
        try { return row ? (JSON.parse(row.value) || {}) : {} } catch { return {} }
      }
      return this.json.replyState || {}
    })()
    value[key] = { ...this.getReplyState(key), ...next }
    if (this.sqlite) {
      this.db.prepare('INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run('replyState', JSON.stringify(value))
    } else {
      this.json.replyState = value
      this._saveJson()
    }
  }

  getReplyQueue() {
    if (this.sqlite) {
      const row = this.db.prepare('SELECT value FROM meta WHERE key = ?').get('replyQueue')
      if (row) {
        try { const parsed = JSON.parse(row.value); if (Array.isArray(parsed)) return parsed } catch {}
      }
    } else if (Array.isArray(this.json.replyQueue)) {
      return this.json.replyQueue
    }
    return []
  }

  createCandidate({ accountId, source = 'comment', talkerId, msgId, bvid = '', root = '', parent = '', reply, reason = '' } = {}) {
    const account = String(accountId || '')
    const talker = String(talkerId || '')
    const msg = String(msgId || '')
    const body = String(reply || '').trim()
    if (!account || !talker || !msg || body === '') fail('bad-request', 'candidate key/reply required')
    const now = new Date().toISOString()
    if (this.sqlite) {
      const existing = this.db.prepare('SELECT id FROM candidate WHERE account_id = ? AND source = ? AND msg_id = ?').get(account, source, msg)
      if (existing) return { item: { id: existing.id }, duplicate: true }
      const id = 'c-' + randomUUID()
      this.db.prepare('INSERT INTO candidate (id, account_id, source, talker_id, msg_id, bvid, root, parent, reply, status, reason, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(id, account, source, talker, msg, bvid, root, parent, body, 'draft', reason, now)
      return { item: { id, accountId: account, source, talkerId: talker, msgId: msg, bvid, root, parent, reply: body, status: 'draft', createdAt: now }, duplicate: false }
    }
    const rows = this.json.candidates || []
    const exists = rows.find((row) => row.accountId === account && row.source === source && row.msgId === msg)
    if (exists) return { item: exists, duplicate: true }
    const item = { id: 'c-' + randomUUID(), accountId: account, source, talkerId: talker, msgId: msg, bvid, root, parent, reply: body, status: 'draft', reason, createdAt: now }
    rows.push(item); this.json.candidates = rows.slice(-2000); this._saveJson()
    return { item, duplicate: false }
  }

  decideCandidate(id, decision, reason = '') {
    if (!['approved', 'rejected', 'review_pending'].includes(decision)) fail('bad-request', 'candidate decision invalid')
    const now = new Date().toISOString()
    if (this.sqlite) {
      const row = this.db.prepare('SELECT status FROM candidate WHERE id = ?').get(String(id))
      if (!row) fail('not-found', 'candidate not found')
      this.db.prepare('UPDATE candidate SET status = ?, reason = ? WHERE id = ?').run(decision, String(reason || ''), String(id))
    } else {
      const row = (this.json.candidates || []).find((item) => item.id === id)
      if (!row) fail('not-found', 'candidate not found')
      row.status = decision; row.reason = String(reason || ''); row.decidedAt = now; this._saveJson()
    }
    return this.getCandidate(id)
  }

  approveCandidate(id) {
    const candidate = this.getCandidate(id)
    if (!candidate) fail('not-found', 'candidate not found')
    if (candidate.status !== 'review_pending' && candidate.status !== 'draft') fail('bad-request', 'candidate is not pending')
    this.decideCandidate(id, 'approved', 'user approved')
    if (candidate.source === 'comment' && candidate.bvid) {
      this.enqueueOutbox({
        accountId: candidate.accountId,
        talkerId: candidate.talkerId,
        msgId: candidate.msgId,
        msgAt: 0,
        kind: 'comment',
        target: String(candidate.bvid || '').startsWith('article:') ? { articleId: String(candidate.bvid).slice(8), root: candidate.root || '', parent: candidate.parent || '' } : { bvid: candidate.bvid, root: candidate.root || '', parent: candidate.parent || '' },
        text: candidate.reply,
        nextAt: new Date().toISOString(),
      })
    }
    return this.getCandidate(id)
  }

  getCandidate(id) {
    if (this.sqlite) return this.db.prepare('SELECT id, account_id AS accountId, source, talker_id AS talkerId, msg_id AS msgId, bvid, root, parent, reply, status, reason, created_at AS createdAt FROM candidate WHERE id = ?').get(String(id)) || null
    return (this.json.candidates || []).find((item) => item.id === id) || null
  }

  listCandidates(accountId = '', status = '') {
    const account = String(accountId || '')
    if (this.sqlite) {
      let sql = 'SELECT id, account_id AS accountId, source, talker_id AS talkerId, msg_id AS msgId, bvid, root, parent, reply, status, reason, created_at AS createdAt FROM candidate'
      const args = []; const where = []
      if (account) { where.push('account_id = ?'); args.push(account) }
      if (status) { where.push('status = ?'); args.push(status) }
      if (where.length) sql += ' WHERE ' + where.join(' AND ')
      return this.db.prepare(sql + ' ORDER BY created_at DESC LIMIT 200').all(...args)
    }
    return (this.json.candidates || []).filter((row) => (!account || row.accountId === account) && (!status || row.status === status)).slice(-200).reverse()
  }

  claimInbox({ accountId, talkerId, msgId, at, text } = {}) {
    const account = String(accountId || '')
    const talker = String(talkerId || '')
    const msg = String(msgId || '')
    if (!account || !talker || !msg) fail('bad-request', 'inbox key required')
    const now = new Date().toISOString()
    if (this.sqlite) {
      const result = this.db.prepare('INSERT OR IGNORE INTO inbox (account_id, talker_id, msg_id, at, text, state, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(account, talker, msg, Number(at || 0), String(text || ''), 'received', now)
      return Number(result.changes || 0) > 0
    }
    const rows = this.json.inbox || []
    if (rows.some((row) => row.accountId === account && row.talkerId === talker && row.msgId === msg)) return false
    rows.push({ accountId: account, talkerId: talker, msgId: msg, at: Number(at || 0), text: String(text || ''), state: 'received', createdAt: now })
    this.json.inbox = rows.slice(-5000)
    this._saveJson()
    return true
  }

  markInbox({ accountId, talkerId, msgId, state } = {}) {
    const account = String(accountId || '')
    const talker = String(talkerId || '')
    const msg = String(msgId || '')
    if (!account || !talker || !msg) return
    if (this.sqlite) this.db.prepare('UPDATE inbox SET state = ? WHERE account_id = ? AND talker_id = ? AND msg_id = ?').run(String(state || 'received'), account, talker, msg)
    else {
      const row = (this.json.inbox || []).find((item) => item.accountId === account && item.talkerId === talker && item.msgId === msg)
      if (row) { row.state = String(state || 'received'); this._saveJson() }
    }
  }

  enqueueOutbox({ accountId, talkerId, msgId, msgAt = 0, kind = 'dm', target = null, text, nextAt } = {}) {
    const account = String(accountId || '')
    const talker = String(talkerId || '')
    const msg = String(msgId || '')
    const body = String(text || '').trim()
    if (!account || !talker || !msg || body === '') fail('bad-request', 'outbox key/text required')
    const now = new Date().toISOString()
    if (this.sqlite) {
      const existing = this.db.prepare('SELECT id FROM outbox WHERE account_id = ? AND talker_id = ? AND msg_id = ?').get(account, talker, msg)
      if (existing) return { item: null, duplicate: true }
      const id = 'o-' + randomUUID()
      this.db.prepare('INSERT INTO outbox (id, account_id, talker_id, msg_id, msg_at, kind, target, text, status, attempts, next_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(id, account, talker, msg, Number(msgAt || 0), kind, target ? JSON.stringify(target) : null, body, 'pending', 0, nextAt || now, now)
      return { item: { id, accountId: account, talkerId: talker, msgId: msg, msgAt: Number(msgAt || 0), kind, target: target || null, text: body, status: 'pending', nextAt: nextAt || now }, duplicate: false }
    }
    const rows = this.json.outbox || []
    if (rows.some((row) => row.accountId === account && row.talkerId === talker && row.msgId === msg)) return { item: null, duplicate: true }
    const item = { id: 'o-' + randomUUID(), accountId: account, talkerId: talker, msgId: msg, msgAt: Number(msgAt || 0), kind, target: target || null, text: body, status: 'pending', attempts: 0, nextAt: nextAt || now, createdAt: now }
    rows.push(item)
    this.json.outbox = rows.slice(-2000)
    this._saveJson()
    return { item, duplicate: false }
  }

  listOutbox(accountId = '') {
    const account = String(accountId || '')
    if (this.sqlite) {
      const rows = account ? this.db.prepare('SELECT id, account_id AS accountId, talker_id AS talkerId, msg_id AS msgId, msg_at AS msgAt, kind, target, text, status, attempts, next_at AS nextAt, created_at AS createdAt, sent_at AS sentAt, error FROM outbox WHERE account_id = ? ORDER BY created_at DESC LIMIT 100').all(account) : []
      return rows
    }
    return (this.json.outbox || []).filter((row) => !account || row.accountId === account).slice(-100).reverse()
  }

  claimOutbox(accountId = '', kind = 'dm', now = new Date().toISOString()) {
    const account = String(accountId || '')
    if (this.sqlite) {
      const row = this.db.prepare("SELECT id, account_id AS accountId, talker_id AS talkerId, msg_id AS msgId, msg_at AS msgAt, kind, target, text, attempts FROM outbox WHERE account_id = ? AND status = 'pending' AND kind = ? AND next_at <= ? ORDER BY created_at ASC LIMIT 1").get(account, kind, now)
      if (!row) return null
      const result = this.db.prepare("UPDATE outbox SET status = 'sending', attempts = attempts + 1 WHERE id = ? AND status = 'pending'").run(row.id)
      return Number(result.changes || 0) > 0 ? row : null
    }
    const row = (this.json.outbox || []).filter((item) => item.accountId === account && (item.kind || 'dm') === kind && item.status === 'pending' && String(item.nextAt) <= now).sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)))[0]
    if (!row) return null
    row.status = 'sending'
    row.attempts = Number(row.attempts || 0) + 1
    this._saveJson()
    return row
  }

  completeOutbox(id, status, error = null) {
    const next = ['sent', 'failed', 'unknown', 'pending'].includes(status) ? status : 'failed'
    const at = new Date().toISOString()
    if (this.sqlite) this.db.prepare('UPDATE outbox SET status = ?, sent_at = ?, error = ? WHERE id = ?').run(next, next === 'sent' ? at : null, error ? String(error).slice(0, 500) : null, String(id))
    else {
      const row = (this.json.outbox || []).find((item) => item.id === id)
      if (row) { row.status = next; row.sentAt = next === 'sent' ? at : null; row.error = error ? String(error).slice(0, 500) : null; this._saveJson() }
    }
  }

  queueReply(input = {}) {
    this._assertNotKilled()
    const source = ['at', 'dm', 'comment'].includes(input.source) ? input.source : 'comment'
    const fromMid = String(input.fromMid ?? '').trim()
    const text = String(input.text ?? '').trim()
    if (text === '') fail('bad-request', 'reply text required')
    if (text.length > 2000) fail('bad-request', 'reply text too long')
    const result = classifyReply({ source, fromMid, text, owners: this._owners(), knownMids: Array.isArray(input.knownMids) ? input.knownMids : [] })
    let item = null
    if (result.mode !== 'ignore') {
      item = {
        id: 'r-' + randomUUID(),
        source,
        fromMid,
        text,
        mode: result.mode,
        reason: result.reason,
        status: result.mode === 'direct' ? 'ready' : 'pending',
        at: new Date().toISOString(),
      }
      const queue = [item, ...this.getReplyQueue()].slice(0, 100)
      this._tx(() => {
        if (this.sqlite) {
          this.db.prepare('INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run('replyQueue', JSON.stringify(queue))
        } else {
          this.json.replyQueue = queue
        }
        this._appendAudit('用户', '回复入队', source + ' · ' + result.mode, '本地 · 未发送')
      })
    }
    return { result, item, queue: this.getReplyQueue() }
  }

  decideReply(id, action) {
    this._assertNotKilled()
    if (typeof id !== 'string' || id === '') fail('bad-request', 'reply id required')
    if (action !== 'approve' && action !== 'reject') fail('bad-request', 'action must be approve or reject')
    const current = this.getReplyQueue().find((item) => item.id === id)
    if (!current) fail('not-found', 'reply not found')
    if (current.status !== 'pending') fail('bad-request', 'only pending replies can be decided')
    const next = this.getReplyQueue().map((item) => item.id === id ? { ...item, status: action === 'approve' ? 'approved' : 'rejected', decidedAt: new Date().toISOString() } : item)
    if (!next.some((item) => item.id === id)) fail('not-found', 'reply not found')
    this._tx(() => {
      if (this.sqlite) {
        this.db.prepare('INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run('replyQueue', JSON.stringify(next))
      } else {
        this.json.replyQueue = next
      }
      this._appendAudit('用户', action === 'approve' ? '回复通过' : '回复驳回', id, '本地 · 未发送')
    })
    return this.getState()
  }

  setOwners(input = {}) {
    this._assertNotKilled()
    const activeSource = input.activeSource === 'mutual' ? 'mutual' : 'manual'
    const source = input.activeSource
    if (source !== 'manual' && source !== 'mutual') fail('bad-request', 'activeSource must be manual or mutual')
    if (!Array.isArray(input.members)) fail('bad-request', 'members must be an array')
    if (input.members.length > 50) fail('bad-request', 'too many owners (max 50)')
    const seen = new Set()
    const members = input.members.map((member) => {
      const mid = String(member?.mid ?? '').trim()
      if (!/^[1-9]\d{0,19}$/.test(mid)) fail('bad-request', 'owner mid must be numeric')
      if (seen.has(mid)) fail('bad-request', 'duplicate owner mid: ' + mid)
      seen.add(mid)
      if (member?.source !== 'manual' && member?.source !== 'mutual') fail('bad-request', 'owner source must be manual or mutual')
      const memberSource = member.source
      return {
        mid,
        name: String(member?.name ?? '').trim().slice(0, 80) || ('UID ' + mid),
        source: memberSource,
        enabled: member?.enabled !== false,
      }
    })
    const value = { activeSource, members }
    this._tx(() => {
      if (this.sqlite) {
        this.db.prepare('INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run('owners', JSON.stringify(value))
      } else {
        this.json.owners = value
      }
      this._appendAudit('用户', '更新主人名单', activeSource + ' · ' + members.length + ' 人', '本地授权')
    })
    return this.getState()
  }

  getFollowRequests() {    if (this.sqlite) {
      const row = this.db.prepare('SELECT value FROM meta WHERE key = ?').get('followRequests')
      if (row) {
        try { const parsed = JSON.parse(row.value); if (Array.isArray(parsed)) return parsed } catch {}
      }
    } else if (Array.isArray(this.json.followRequests)) {
      return this.json.followRequests
    }
    return []
  }

  followsToday() {
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' })
    return this.getFollowRequests().filter((item) => {
      if (item.status !== 'executed' && item.status !== 'executing' && item.status !== 'failed' && item.status !== 'unknown') return false
      const raw = item.executedAt || item.executingAt
      if (!raw) return false
      return new Date(raw).toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' }) === today
    }).length
  }

  beginFollow(id) {
    this._assertNotKilled()
    if (typeof id !== 'string' || id === '') fail('bad-request', 'follow id required')
    const item = this.getFollowRequests().find((row) => row.id === id)
    if (!item) fail('not-found', 'follow request not found')
    if (item.status !== 'approved') fail('bad-request', 'only approved follow can execute')
    const next = this.getFollowRequests().map((row) => row.id === id ? { ...row, status: 'executing', executingAt: new Date().toISOString() } : row)
    this._tx(() => {
      this._writeFollowRequests(next)
      this._appendAudit('用户', '关注执行中', item.name + ' · ' + item.mid, '已占用本次批准')
    })
    return { ...item, status: 'executing' }
  }

  finishFollow(id, ok, outcome) {
    const status = ok ? 'executed' : (outcome === 'unknown' ? 'unknown' : 'failed')
    const next = this.getFollowRequests().map((row) => row.id === id ? { ...row, status, executedAt: new Date().toISOString() } : row)
    const item = next.find((row) => row.id === id)
    this._tx(() => {
      this._writeFollowRequests(next)
      this._appendAudit('用户', ok ? '关注成功' : (status === 'unknown' ? '关注结果未知' : '关注失败'), item?.name + ' · ' + item?.mid, ok ? '真实关注已执行' : (status === 'unknown' ? '可能已执行 · 不自动重试' : '接口失败'))
    })
    return this.getState()
  }

  _writeFollowRequests(next) {
    if (this.sqlite) {
      this.db.prepare('INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run('followRequests', JSON.stringify(next))
    } else {
      this.json.followRequests = next
    }
  }

  requestFollow(input = {}) {
    this._assertNotKilled()
    const mid = String(input.mid ?? '').trim()
    if (!/^[1-9]\d{0,19}$/.test(mid)) fail('bad-request', 'follow mid must be numeric')
    if (this.getFollowRequests().some((item) => item.mid === mid && item.status === 'pending')) {
      fail('bad-request', 'follow request already pending')
    }
    const item = {
      id: 'f-' + randomUUID(),
      mid,
      name: String(input.name ?? '').trim().slice(0, 80) || ('UID ' + mid),
      status: 'pending',
      at: new Date().toISOString(),
    }
    const queue = [item, ...this.getFollowRequests()].slice(0, 500)
    this._tx(() => {
      if (this.sqlite) {
        this.db.prepare('INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run('followRequests', JSON.stringify(queue))
      } else {
        this.json.followRequests = queue
      }
      this._appendAudit('用户', '关注请求', item.name + ' · ' + mid, '待主人确认 · 未关注')
    })
    return this.getState()
  }

  decideFollow(id, action) {
    this._assertNotKilled()
    if (typeof id !== 'string' || id === '') fail('bad-request', 'follow id required')
    if (action !== 'approve' && action !== 'reject') fail('bad-request', 'action must be approve or reject')
    const current = this.getFollowRequests().find((item) => item.id === id)
    if (!current) fail('not-found', 'follow request not found')
    if (current.status !== 'pending') fail('bad-request', 'only pending follow requests can be decided')
    const next = this.getFollowRequests().map((item) => item.id === id ? { ...item, status: action === 'approve' ? 'approved' : 'rejected', decidedAt: new Date().toISOString() } : item)
    if (!next.some((item) => item.id === id)) fail('not-found', 'follow request not found')
    this._tx(() => {
      if (this.sqlite) {
        this.db.prepare('INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run('followRequests', JSON.stringify(next))
      } else {
        this.json.followRequests = next
      }
      this._appendAudit('用户', action === 'approve' ? '关注确认' : '关注驳回', id, '仅确认 · 未调用关注接口')
    })
    return this.getState()
  }

  recordAutoReply({ fromMid = '', text = '', reply = '', mode = 'direct' } = {}) {
    this._appendAudit('自动回复', mode, String(fromMid) + ' · ' + String(text).slice(0, 60), reply ? '已发送' : '未发送')
    return this.getState()
  }

  _appendAudit(actor, action, object, result) {
    const at = nowTime()
    if (this.sqlite) {
      this.db.prepare('INSERT INTO audit (at, actor, action, object, result) VALUES (?, ?, ?, ?, ?)').run(at, actor, action, object, result)
    } else {
      this.json.audit.push({ at, actor, action, object, result })
      if (this.json.audit.length > 500) this.json.audit = this.json.audit.slice(-500)
    }
  }

  setSettings(patch) {
    this._assertNotKilled()
    const clean = validatePatch(patch)
    if (this.sqlite) {
      const current = JSON.parse(this.db.prepare('SELECT json FROM settings WHERE id = 1').get().json)
      const next = { ...current, ...clean }
      this.db.exec('BEGIN')
      try {
        this.db.prepare('UPDATE settings SET json = ? WHERE id = 1').run(JSON.stringify(next))
        this._appendAudit('用户', '保存设置', '养鱼 · 本地配置', '已写入 host')
        this.db.exec('COMMIT')
      } catch (error) {
        this.db.exec('ROLLBACK')
        throw error
      }
    } else {
      this.json.settings = { ...this.json.settings, ...clean }
      this._appendAudit('用户', '保存设置', '养鱼 · 本地配置', '已写入 host')
      this._saveJson()
    }
    return this.getState()
  }

  createContent(input = {}) {
    this._assertNotKilled()
    const title = typeof input?.title === 'string' ? input.title.trim() : ''
    if (title === '') fail('bad-request', 'title required')
    if (title.length > 200) fail('bad-request', 'title too long')
    const script = input?.script === undefined || input?.script === null ? '' : input.script
    if (typeof script !== 'string') fail('bad-request', 'script must be string')
    if (script.length > 20000) fail('bad-request', 'script too long')
    const kind = input?.kind === 'article' ? 'article' : 'video'
    const row = {
      id: 'c-' + randomUUID(),
      version: 1,
      title,
      script,
      kind,
      state: input?.state === 'idea' ? 'idea' : 'draft',
      updatedAt: new Date().toISOString(),
    }
    this._tx(() => {
      this._writeContent(row)
      this._appendAudit('用户', '新建草稿', title, 'v1 · 本地草稿 · 未发布')
    })
    return this.getState()
  }

  updateContent(input = {}) {
    this._assertNotKilled()
    const id = typeof input?.id === 'string' ? input.id : ''
    if (id === '') fail('bad-request', 'id required')
    const current = this._contentRow(id)
    if (!current) fail('not-found', 'content not found')
    if (input?.version === undefined || input?.version === null || input?.version === '') {
      fail('bad-request', 'version required for update (optimistic lock)')
    }
    if (Number(input.version) !== current.version) {
      fail('approval_stale', 'content version changed')
    }
    let title = current.title
    if (input?.title !== undefined) {
      const nextTitle = typeof input.title === 'string' ? input.title.trim() : ''
      if (nextTitle === '') fail('bad-request', 'title required')
      if (nextTitle.length > 200) fail('bad-request', 'title too long')
      title = nextTitle
    }
    let script = current.script
    if (input?.script !== undefined) {
      if (typeof input.script !== 'string') fail('bad-request', 'script must be string')
      if (input.script.length > 20000) fail('bad-request', 'script too long')
      script = input.script
    }
    const kind = input?.kind === 'article' || input?.kind === 'video' ? input.kind : (current.kind || 'video')
    const next = {
      ...current,
      title,
      script,
      kind,
      version: current.version + 1,
      state: ['idea', 'approval_pending', 'approved', 'rejected'].includes(current.state) ? 'draft' : current.state,
      updatedAt: new Date().toISOString(),
    }
    this._tx(() => {
      this._markPendingStale(current.id)
      this._writeContent(next)
      this._appendAudit('用户', '更新草稿', title, 'v' + next.version + ' · 旧审批自动失效 · 未发布')
    })
    return this.getState()
  }

  deleteContent(id) {
    this._assertNotKilled()
    if (typeof id !== 'string' || id === '') fail('bad-request', 'id required')
    const content = this._contentRow(id)
    if (!content) fail('not-found', 'content not found')
    if (!['draft', 'rejected', 'idea'].includes(content.state)) {
      fail('bad-request', 'only draft/rejected content can be deleted')
    }
    this._tx(() => {
      if (this.sqlite) {
        this.db.prepare('DELETE FROM content WHERE id = ?').run(id)
        this.db.prepare('DELETE FROM approval WHERE content_id = ?').run(id)
      } else {
        this.json.content = (this.json.content || []).filter((item) => item.id !== id)
        this.json.approval = (this.json.approval || []).filter((item) => item.contentId !== id)
      }
      this._appendAudit('用户', '删除草稿', content.title, '本地删除 · 未发布')
    })
    return this.getState()
  }

  submitApproval(id, version) {
    this._assertNotKilled()
    if (typeof id !== 'string' || id === '') fail('bad-request', 'id required')
    const content = this._contentRow(id)
    if (!content) fail('not-found', 'content not found')
    if (version !== undefined && version !== null && Number(version) !== content.version) {
      fail('approval_stale', 'content version changed')
    }
    if (content.state !== 'draft') fail('bad-request', 'only draft content can be submitted (state=' + content.state + ')')
    const at = new Date().toISOString()
    const approval = {
      id: 'ap-' + randomUUID(),
      contentId: content.id,
      version: content.version,
      decision: 'pending',
      actor: '',
      reason: null,
      at,
    }
    const next = { ...content, state: 'approval_pending', updatedAt: at }
    this._tx(() => {
      this._writeContent(next)
      this._writeApproval(approval)
      this._appendAudit('用户', '提交审批', content.title, 'v' + content.version + ' · 等待人工审批')
    })
    return this.getState()
  }

  approveContent(id, version) {
    this._assertNotKilled()
    if (typeof id !== 'string' || id === '') fail('bad-request', 'id required')
    const approval = this._approvalRow(id)
    if (!approval) fail('not-found', 'approval not found')
    if (approval.decision === 'approval_stale') fail('approval_stale', 'approval is stale: content changed')
    if (approval.decision !== 'pending') fail('not-found', 'approval is not pending')
    if (version !== undefined && version !== null && Number(version) !== approval.version) {
      fail('approval_stale', 'approval version changed')
    }
    const content = this._contentRow(approval.contentId)
    if (!content) fail('not-found', 'content not found')
    if (content.version !== approval.version) fail('approval_stale', 'approval is stale: content version changed')
    if (content.state !== 'approval_pending') fail('bad-request', 'content is not awaiting approval (state=' + content.state + ')')
    const at = new Date().toISOString()
    // The actor is fixed to the human user; no caller-supplied actor is accepted.
    const nextApproval = { ...approval, decision: 'approved', actor: '用户', at }
    const nextContent = { ...content, state: 'approved', updatedAt: at }
    this._tx(() => {
      this._writeApproval(nextApproval)
      this._writeContent(nextContent)
      this._appendAudit('用户', '审批通过', content.title, 'v' + content.version + ' · 已批准 · 仅记录 · 未发布')
    })
    return this.getState()
  }

  rejectContent(id, reason, version) {
    this._assertNotKilled()
    if (typeof id !== 'string' || id === '') fail('bad-request', 'id required')
    const approval = this._approvalRow(id)
    if (!approval) fail('not-found', 'approval not found')
    if (approval.decision === 'approval_stale') fail('approval_stale', 'approval is stale: content changed')
    if (approval.decision !== 'pending') fail('not-found', 'approval is not pending')
    const text = typeof reason === 'string' ? reason.trim() : ''
    if (text === '') fail('bad-request', 'reject reason required')
    if (text.length > 2000) fail('bad-request', 'reject reason too long')
    if (version !== undefined && version !== null && Number(version) !== approval.version) {
      fail('approval_stale', 'approval version changed')
    }
    const content = this._contentRow(approval.contentId)
    if (!content) fail('not-found', 'content not found')
    if (content.version !== approval.version) fail('approval_stale', 'approval is stale: content version changed')
    if (content.state !== 'approval_pending') fail('bad-request', 'content is not awaiting approval (state=' + content.state + ')')
    const at = new Date().toISOString()
    const nextApproval = { ...approval, decision: 'rejected', actor: '用户', reason: text, at }
    const nextContent = { ...content, state: 'rejected', updatedAt: at }
    this._tx(() => {
      this._writeApproval(nextApproval)
      this._writeContent(nextContent)
      this._appendAudit('用户', '驳回', content.title, 'v' + content.version + ' · 原因：' + text + ' · 未发布')
    })
    return this.getState()
  }

  kill() {
    this.reviveChallenge = null
    this.reviveExpiresAt = 0
    this._tx(() => {
      this._setKilled(true)
      this._appendAudit('用户', '停机', 'kill switch', '所有写操作已拒绝 · 恢复需二次确认')
    })
    return this.getState()
  }

  requestRevive() {
    if (!this.isKilled()) fail('bad-request', 'kill switch is not on')
    const challenge = randomUUID()
    this.reviveChallenge = challenge
    this.reviveExpiresAt = Date.now() + 60000
    return {
      ok: true,
      value: { challenge, expiresAt: new Date(this.reviveExpiresAt).toISOString() },
    }
  }

  revive(confirm, challenge) {
    if (confirm !== 'REVIVE') fail('bad-request', "revive requires confirm='REVIVE'")
    if (typeof challenge !== 'string' || challenge === '' ||
        this.reviveChallenge === null || challenge !== this.reviveChallenge ||
        Date.now() > this.reviveExpiresAt) {
      fail('bad-request', 'revive challenge missing or expired; request a new confirmation first')
    }
    this.reviveChallenge = null
    this.reviveExpiresAt = 0
    this._tx(() => {
      this._setKilled(false)
      this._appendAudit('用户', '恢复', 'kill switch', '恢复写入 · 仍只读 · 不发布')
    })
    return this.getState()
  }

  approve(id) {
    this._assertNotKilled()
    if (typeof id !== 'string' || id === '') fail('bad-request', 'id required')
    if (this.sqlite) {
      const row = this.db.prepare('SELECT json FROM pending WHERE id = ? AND status = ?').get(id, 'pending')
      if (!row) fail('not-found', 'pending item not found')
      this.db.exec('BEGIN')
      try {
        this.db.prepare('UPDATE pending SET status = ? WHERE id = ?').run('approved', id)
        this._appendAudit('用户', '审批通过', JSON.parse(row.json).who, '仅记录 · 未发送')
        this.db.exec('COMMIT')
      } catch (error) {
        this.db.exec('ROLLBACK')
        throw error
      }
    } else {
      const item = this.json.pending.find((x) => x.id === id && x.status === 'pending')
      if (!item) fail('not-found', 'pending item not found')
      item.status = 'approved'
      this._appendAudit('用户', '审批通过', item.who, '仅记录 · 未发送')
      this._saveJson()
    }
    return this.getState()
  }

  reject(id) {
    this._assertNotKilled()
    if (typeof id !== 'string' || id === '') fail('bad-request', 'id required')
    if (this.sqlite) {
      const row = this.db.prepare('SELECT json FROM pending WHERE id = ? AND status = ?').get(id, 'pending')
      if (!row) fail('not-found', 'pending item not found')
      this.db.exec('BEGIN')
      try {
        this.db.prepare('UPDATE pending SET status = ? WHERE id = ?').run('rejected', id)
        this._appendAudit('用户', '驳回', JSON.parse(row.json).who, '未发送')
        this.db.exec('COMMIT')
      } catch (error) {
        this.db.exec('ROLLBACK')
        throw error
      }
    } else {
      const item = this.json.pending.find((x) => x.id === id && x.status === 'pending')
      if (!item) fail('not-found', 'pending item not found')
      item.status = 'rejected'
      this._appendAudit('用户', '驳回', item.who, '未发送')
      this._saveJson()
    }
    return this.getState()
  }
}

export function createStore(directory) {
  return new Store(directory)
}
