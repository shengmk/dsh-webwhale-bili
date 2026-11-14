import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync, copyFileSync } from 'node:fs'
import { join, extname } from 'node:path'
import { randomUUID } from 'node:crypto'

const KINDS = new Set(['article', 'video', 'live', 'emoji', 'emoji-incoming'])
const TYPES = new Set(['image', 'text', 'template'])
const MAX = 5 * 1024 * 1024

function rootOf(store, kind) {
  if (!KINDS.has(kind)) throw Object.assign(new Error('invalid asset kind'), { code: 'bad-request' })
  const root = join(store.directory, 'assets', kind)
  mkdirSync(root, { recursive: true })
  return root
}

function indexPath(store, kind) {
  return join(rootOf(store, kind), 'index.json')
}

function readIndex(store, kind) {
  const path = indexPath(store, kind)
  if (!existsSync(path)) return []
  try { const value = JSON.parse(readFileSync(path, 'utf8')); return Array.isArray(value) ? value : [] } catch { return [] }
}

function writeIndex(store, kind, list) {
  writeFileSync(indexPath(store, kind), JSON.stringify(list, null, 2), 'utf8')
}

export function listAssets(store, kind) {
  const root = rootOf(store, kind)
  return readIndex(store, kind).map((row) => {
    if (row.type !== 'image') return row
    try {
      const buf = readFileSync(join(root, row.file))
      const ext = extname(row.file).toLowerCase()
      const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : ext === '.gif' ? 'image/gif' : ext === '.svg' ? 'image/svg+xml' : 'image/jpeg'
      return { ...row, dataUrl: 'data:' + mime + ';base64,' + buf.toString('base64') }
    } catch { return row }
  })
}

export function saveAsset(store, kind, { name, dataUrl, text } = {}) {
  const root = rootOf(store, kind)
  const type = text !== undefined ? 'text' : 'image'
  const safe = String(name ?? 'asset').trim().replace(/[^A-Za-z0-9._-]/g, '_').slice(0, 80) || 'asset'
  let payload
  let ext = extname(safe).toLowerCase()
  if (type === 'image') {
    const match = /^data:(image\/(png|jpeg|webp|gif|svg\+xml));base64,(.+)$/.exec(String(dataUrl || ''))
    if (!match) throw Object.assign(new Error('image must be png/jpeg/webp/gif/svg data URL'), { code: 'bad-request' })
    payload = Buffer.from(match[3], 'base64')
    if (payload.length > MAX) throw Object.assign(new Error('asset too large (max 5MB)'), { code: 'bad-request' })
    ext = ext === '' ? (match[2] === 'jpeg' ? '.jpg' : match[2] === 'svg+xml' ? '.svg' : '.' + match[2]) : ext
  } else {
    if (typeof text !== 'string' || text.length > 20000) throw Object.assign(new Error('text asset must be 1-20000 chars'), { code: 'bad-request' })
    payload = Buffer.from(text, 'utf8')
    ext = ext === '' ? '.txt' : ext
  }
  const id = 'as-' + randomUUID()
  const file = id + ext
  writeFileSync(join(root, file), payload)
  const list = readIndex(store, kind)
  const row = { id, kind, type, name: safe, file, size: payload.length, createdAt: new Date().toISOString() }
  writeIndex(store, kind, [row, ...list].slice(0, 200))
  return row
}

export function deleteAsset(store, kind, id) {
  const root = rootOf(store, kind)
  const list = readIndex(store, kind)
  const row = list.find((item) => item.id === id)
  if (!row) throw Object.assign(new Error('asset not found'), { code: 'not-found' })
  try { unlinkSync(join(root, row.file)) } catch {}
  writeIndex(store, kind, list.filter((item) => item.id !== id))
  return { ok: true }
}

export function getAsset(store, kind, id) {
  const root = rootOf(store, kind)
  const row = readIndex(store, kind).find((item) => item.id === String(id || ''))
  if (!row) throw Object.assign(new Error('asset not found'), { code: 'not-found' })
  return { ...row, path: join(root, row.file) }
}

export function patchAsset(store, kind, id, patch = {}) {
  const root = rootOf(store, kind)
  const list = readIndex(store, kind)
  const index = list.findIndex((item) => item.id === String(id || ''))
  if (index < 0) throw Object.assign(new Error('asset not found'), { code: 'not-found' })
  const next = { ...list[index], ...patch, id: list[index].id, kind, file: list[index].file }
  list[index] = next
  writeIndex(store, kind, list)
  return { ...next, path: join(root, next.file) }
}

/**
 * Download a remote B站 image into an asset index. The URL must be https and
 * on a B站 image host; this is intentionally narrow so a DM cannot make the
 * host fetch arbitrary URLs.
 */
export async function saveRemoteImage(store, kind, { url, name = 'dm-image', meta = {}, fetchImpl = globalThis.fetch } = {}) {
  let parsed
  try { parsed = new URL(String(url || '')) } catch { throw Object.assign(new Error('invalid image url'), { code: 'bad-request' }) }
  if (parsed.protocol !== 'https:' || !['hdslb.com', 'biliimg.com'].some((host) => parsed.hostname === host || parsed.hostname.endsWith('.' + host))) {
    throw Object.assign(new Error('image host not allowed'), { code: 'bad-request' })
  }
  if (typeof fetchImpl !== 'function') throw Object.assign(new Error('fetch unavailable'), { code: 'bad-request' })
  const response = await fetchImpl(parsed.toString(), {
    headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36', referer: 'https://www.bilibili.com/' },
  })
  if (!response.ok) throw Object.assign(new Error('image download failed: HTTP ' + response.status), { code: 'bad-request' })
  const buffer = Buffer.from(await response.arrayBuffer())
  if (buffer.length === 0 || buffer.length > MAX) throw Object.assign(new Error('incoming image too large (max 5MB)'), { code: 'bad-request' })
  const mime = String(response.headers?.get?.('content-type') || 'image/jpeg').split(';')[0].trim().toLowerCase()
  if (!/^image\/(png|jpeg|webp|gif)$/.test(mime)) throw Object.assign(new Error('incoming file is not a supported image'), { code: 'bad-request' })
  const dataUrl = 'data:' + mime + ';base64,' + buffer.toString('base64')
  const row = saveAsset(store, kind, { name: String(name || 'dm-image') + (extname(String(name || '')) ? '' : (mime === 'image/png' ? '.png' : mime === 'image/webp' ? '.webp' : mime === 'image/gif' ? '.gif' : '.jpg')), dataUrl })
  return patchAsset(store, kind, row.id, { ...meta, status: meta.status || 'pending', sourceUrl: parsed.toString() })
}

export function promoteAsset(store, id) {
  const source = getAsset(store, 'emoji-incoming', id)
  const root = rootOf(store, 'emoji')
  const nextId = 'as-' + randomUUID()
  const ext = extname(source.file) || '.png'
  const file = nextId + ext
  copyFileSync(source.path, join(root, file))
  const list = readIndex(store, 'emoji')
  const row = {
    id: nextId,
    kind: 'emoji',
    type: 'image',
    name: source.name || '表情包',
    file,
    size: source.size || 0,
    createdAt: new Date().toISOString(),
    sourceUrl: source.sourceUrl || '',
    talkerId: source.talkerId || '',
  }
  writeIndex(store, 'emoji', [row, ...list].slice(0, 200))
  deleteAsset(store, 'emoji-incoming', source.id)
  return row
}
