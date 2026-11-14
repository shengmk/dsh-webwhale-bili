import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { homedir } from 'node:os'

const PLUGIN_ROOT = join(dirname(dirname(fileURLToPath(import.meta.url))), 'personas')
const MAP = [
  ['01-deepseek-whale.md', { key: 'deepseek-whale', file: '01-deepseek-whale.md', label: 'DeepSeek 鲸鱼娘', roleName: '鲸鱼娘', callYou: '主人', selfName: '我' }],
  ['02-kaguya.md', { key: 'kaguya', file: '02-kaguya.md', label: '辉夜（超辉夜姬）', roleName: '辉夜', callYou: '你', selfName: '我' }],
  ['03-yachiyo.md', { key: 'yachiyo', file: '03-yachiyo.md', label: '月见八千代', roleName: '八千代', callYou: '你', selfName: '我' }],
]

export function resolvePersonaDir(raw) {
  const text = String(raw ?? '').trim()
  if (text === '') return PLUGIN_ROOT
  const expanded = text === '~' ? homedir() : text.startsWith('~/') || text.startsWith('~\\') ? join(homedir(), text.slice(2)) : text
  mkdirSync(expanded, { recursive: true })
  return expanded
}

export function listPersonas(rawDir, rawPaths = '') {
  const root = resolvePersonaDir(rawDir)
  const defaults = MAP.flatMap(([file, meta]) => {
    const path = join(root, file)
    if (!existsSync(path)) return []
    return [{ ...meta, persona: readFileSync(path, 'utf8') }]
  })
  const paths = String(rawPaths || '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean).slice(0, 12)
  const external = []
  for (const [index, rawPath] of paths.entries()) {
    const path = rawPath === '~' ? homedir() : rawPath.startsWith('~/') || rawPath.startsWith('~\\') ? join(homedir(), rawPath.slice(2)) : rawPath
    if (!existsSync(path) || !/\.(md|txt)$/i.test(path)) continue
    try {
      const content = readFileSync(path, 'utf8')
      const name = path.split(/[\\/]/).pop().replace(/\.(md|txt)$/i, '')
      external.push({
        key: 'external-' + index,
        file: path.split(/[\\/]/).pop(),
        external: true,
        path,
        label: name + '（外部）',
        roleName: name,
        callYou: '你',
        selfName: '我',
        persona: content.slice(0, 20000),
      })
    } catch {}
  }
  return [...defaults, ...external]
}

export function savePersona(rawDir, { name, content } = {}) {
  const safe = String(name ?? '').trim().replace(/[^A-Za-z0-9._-]/g, '_')
  if (!safe.toLowerCase().endsWith('.md')) throw Object.assign(new Error('persona file must be .md'), { code: 'bad-request' })
  if (typeof content !== 'string' || content.trim() === '' || content.length > 20000) {
    throw Object.assign(new Error('persona content must be 1-20000 chars'), { code: 'bad-request' })
  }
  const root = resolvePersonaDir(rawDir)
  const path = join(root, safe)
  writeFileSync(path, content, 'utf8')
  return { name: safe, path, bytes: Buffer.byteLength(content) }
}
