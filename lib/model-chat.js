/**
 * Dedicated B站 DM model conversation.
 *
 * This is deliberately separate from the DSH session that operates the plugin:
 *  - persistent per-talker history in the plugin account directory
 *  - persona loaded from the user's persona file
 *  - API key resolved through DSH credentials, never stored in settings
 *
 * The caller may provide a fake fetch for controlled tests.
 */
import { existsSync, readFileSync, writeFileSync, renameSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { listPersonas } from './personas.js'
import { emoticonPrompt } from './emoticons.js'

const MODEL = 'deepseek-chat'
const ENDPOINT = 'https://api.deepseek.com/chat/completions'
const MAX_TURNS = 24

function safeRead(path) {
  try {
    if (!existsSync(path)) return { version: 1, conversations: {} }
    const parsed = JSON.parse(readFileSync(path, 'utf8'))
    return parsed && parsed.conversations ? parsed : { version: 1, conversations: {} }
  } catch {
    return { version: 1, conversations: {} }
  }
}

function safeWrite(path, value) {
  mkdirSync(dirname(path), { recursive: true })
  const tmp = path + '.tmp'
  writeFileSync(tmp, JSON.stringify(value, null, 2), 'utf8')
  renameSync(tmp, path)
}

function personaText(settings = {}) {
  try {
    const personas = listPersonas(settings.personaDir, settings.personaPaths)
    const file = String(settings.personaFile || '')
    const hit = personas.find((item) => item.file === file) || personas.find((item) => item.key === settings.personaPreset) || personas[0]
    if (hit?.persona) return hit.persona.slice(0, 12000)
  } catch {}
  return '你是 B站账号的私信助手。称呼对方为「你」，不要自称主人。'
}

export function splitReplyParts(answer, maxParts = 3) {
  const text = String(answer || '').replace(/\r/g, '').trim()
  if (!text) return []
  const raw = text.split(/\s*\|\|\|\s*/).map((part) => part.trim()).filter(Boolean)
  if (raw.length <= 1) return [text]
  if (raw.length <= maxParts) return raw.slice(0, maxParts)
  // Preserve content rather than silently dropping the tail.
  return [...raw.slice(0, maxParts - 1), raw.slice(maxParts - 1).join(' ')].slice(0, maxParts)
}

function systemPrompt(settings = {}) {
  return [
    personaText(settings),
    '',
    '【私信对话规则】',
    '- 这是 B站私信，不是 DSH 控制台；不要提插件、RPC、自动化实现。',
    '- 对方每发一条消息都要回应一条；对方同时发多条时，逐条回应，不要合并成一句敷衍。',
    '- 如果一条回复分成几条短消息更自然，可以用 ||| 分隔，最多 3 段；这些段仍视为同一条回复，不要每段重复称呼或重复回答。',
    '- 回复要短，通常 1–3 句，符合人设，不要复读同一句模板。',
    '- 对方发来图片时，只做简短回应；不要假装看清了具体内容，也不要复述图片里的隐私信息。',
    '- 不泄露任何个人隐私、账号、cookie、住址、联系方式。',
    '- 不在公开内容或私信里 @ 主人；不引导对方加外部联系方式。',
    '- 不打开或复述可疑链接，不参与违法、违规、伤害性内容。',
    '- 不知道就承认不知道；不要编造事实或承诺现实中的行动。',
    '- 只输出要发送给对方的正文，不要输出分析、JSON、前后缀或引号。',
    '',
    emoticonPrompt(),
  ].join('\n')
}

export function createModelChat({ store, credentials, directory, warn = () => {}, fetchImpl = globalThis.fetch } = {}) {
  const path = join(directory || store?.directory || '.', 'model-chat.json')
  let cache = null

  function data() {
    if (!cache) cache = safeRead(path)
    return cache
  }

  function history(talkerId) {
    const item = data().conversations[String(talkerId)]
    return Array.isArray(item?.messages) ? item.messages : []
  }

  function save(talkerId, messages) {
    const db = data()
    db.conversations[String(talkerId)] = { messages: messages.slice(-MAX_TURNS), updatedAt: new Date().toISOString() }
    safeWrite(path, db)
  }

  async function resolveKey() {
    if (!credentials?.resolve) return ''
    try {
      let ref = 'DEEPSEEK_API_KEY'
      try {
        const mod = await import('@deepseek-ai/dsh-credentials')
        ref = mod.credentialRef?.(ref) || ref
      } catch {}
      const hit = await credentials.resolve(ref)
      return String(hit?.value || '')
    } catch (error) {
      warn('model credential resolve failed: ' + (error?.message || error))
      return ''
    }
  }

  async function reply({ talkerId, name = '', text = '', settings = {} } = {}) {
    const body = String(text || '').trim()
    if (!body || !fetchImpl) return null
    const key = await resolveKey()
    if (!key) return null
    const prior = history(talkerId)
    const messages = [
      { role: 'system', content: systemPrompt(settings) },
      ...prior.map((item) => ({ role: item.role, content: item.content })),
      { role: 'user', content: name ? `${name}：${body}` : body },
    ]
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 20000)
    try {
      const response = await fetchImpl(ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: 'Bearer ' + key },
        body: JSON.stringify({ model: MODEL, messages, temperature: 0.85, max_tokens: 320 }),
        signal: controller.signal,
      })
      if (!response.ok) {
        warn('model http ' + response.status)
        return null
      }
      const payload = await response.json()
      const answer = String(payload?.choices?.[0]?.message?.content || '').trim()
      if (!answer) return null
      const parts = splitReplyParts(answer, 3)
      const next = [...prior, { role: 'user', content: body }, { role: 'assistant', content: answer }]
      save(talkerId, next)
      try { store?.addMemory?.({ layer: 'short', text: '私信对话：' + body.slice(0, 200), tags: ['dm', 'model'] }) } catch {}
      return { text: parts.join('\n'), parts, source: 'model' }
    } catch (error) {
      warn('model chat failed: ' + (error?.name === 'AbortError' ? 'timeout' : (error?.message || error)))
      return null
    } finally {
      clearTimeout(timer)
    }
  }

  async function status() {
    const key = await resolveKey()
    return {
      configured: Boolean(key),
      model: MODEL,
      conversations: Object.keys(data().conversations).length,
      historyPath: path,
    }
  }

  return { reply, status, history }
}
