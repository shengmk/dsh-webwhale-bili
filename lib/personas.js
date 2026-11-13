import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(dirname(fileURLToPath(import.meta.url))), 'personas')
const MAP = [
  ['01-deepseek-whale.md', { key: 'deepseek-whale', label: 'DeepSeek 鲸鱼娘', roleName: '鲸鱼娘', callYou: '主人', selfName: '我' }],
  ['02-kaguya.md', { key: 'kaguya', label: '辉夜（超辉夜姬）', roleName: '辉夜', callYou: '你', selfName: '我' }],
  ['03-yachiyo.md', { key: 'yachiyo', label: '月见八千代', roleName: '八千代', callYou: '你', selfName: '我' }],
]

export function listPersonas() {
  return MAP.flatMap(([file, meta]) => {
    const path = join(ROOT, file)
    if (!existsSync(path)) return []
    return [{ ...meta, persona: readFileSync(path, 'utf8') }]
  })
}
