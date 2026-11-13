/**
 * Account registry and per-account data roots. The default account keeps the
 * existing root directory; extra accounts get isolated directories.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'

const ROOT = join(homedir(), '.dsh', 'webwhale-bili')
const FILE = join(ROOT, 'accounts.json')

function read() {
  if (!existsSync(FILE)) {
    return { activeId: 'default', switchSeq: 0, accounts: [{ id: 'default', name: '主账号', dir: ROOT, mid: '' }] }
  }
  const value = JSON.parse(readFileSync(FILE, 'utf8'))
  if (!value || !Array.isArray(value.accounts) || value.accounts.length === 0) throw new Error('accounts.json 损坏，已拒绝启动以避免切换错账号')
  if (!Number.isInteger(value.switchSeq) || value.switchSeq < 0) value.switchSeq = 0
  return value
}

function write(value) {
  mkdirSync(ROOT, { recursive: true })
  const temp = FILE + '.tmp'
  writeFileSync(temp, JSON.stringify(value, null, 2) + '\n')
  renameSync(temp, FILE)
}

export function listAccounts() {
  const value = read()
  return {
    activeId: value.activeId,
    max: 5,
    accounts: value.accounts.map((account) => ({
      id: account.id,
      name: account.name,
      mid: account.mid,
      active: account.id === value.activeId,
    })),
  }
}

export function updateActiveAccount({ mid, name } = {}) {
  const value = read()
  const account = value.accounts.find((item) => item.id === value.activeId)
  if (!account) return
  if (mid) account.mid = String(mid)
  if (name) account.name = String(name).slice(0, 40)
  write(value)
}

export function accountById(id) {
  const value = read()
  const account = value.accounts.find((item) => item.id === id)
  if (!account) return null
  return { id: account.id, name: account.name, mid: account.mid, dir: account.dir }
}

export function updateAccount(id, { mid, name } = {}) {
  const value = read()
  const account = value.accounts.find((item) => item.id === id)
  if (!account) return
  if (mid) account.mid = String(mid)
  if (name) account.name = String(name).slice(0, 40)
  write(value)
}

export function createAccount({ name } = {}) {
  const value = read()
  if (value.accounts.length >= 5) {
    const error = new Error('最多 5 个账号')
    error.code = 'bad-request'
    throw error
  }
  const id = 'a-' + randomUUID()
  const dir = join(ROOT, 'accounts', id)
  mkdirSync(dir, { recursive: true })
  const account = { id, name: String(name ?? '').trim().slice(0, 40) || ('账号 ' + (value.accounts.length + 1)), dir, mid: '' }
  value.accounts.push(account)
  write(value)
  return { id: account.id, name: account.name, mid: account.mid, active: false }
}

export function setActiveAccount(id) {
  const value = read()
  const account = value.accounts.find((item) => item.id === id)
  if (!account) {
    const error = new Error('账号不存在')
    error.code = 'not-found'
    throw error
  }
  value.activeId = account.id
  value.switchSeq = (Number.isInteger(value.switchSeq) ? value.switchSeq : 0) + 1
  write(value)
  return { id: account.id, name: account.name, mid: account.mid, active: true, requiresReload: true }
}

export function activeState() {
  const value = read()
  const account = value.accounts.find((item) => item.id === value.activeId)
  if (!account || !account.dir) throw new Error('当前账号目录无效，已拒绝回退到默认账号')
  if (!existsSync(account.dir)) throw new Error('当前账号目录不存在，已拒绝回退到默认账号')
  return { id: account.id, dir: account.dir, switchSeq: Number.isInteger(value.switchSeq) ? value.switchSeq : 0 }
}

export function activeDirectory() {
  const value = read()
  const account = value.accounts.find((item) => item.id === value.activeId)
  if (!account || !account.dir) throw new Error('当前账号目录无效，已拒绝回退到默认账号')
  if (!existsSync(account.dir)) throw new Error('当前账号目录不存在，已拒绝回退到默认账号')
  return account.dir
}
