import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createModelChat, splitReplyParts } from '../lib/model-chat.js'
import { enqueueReplyParts } from '../lib/auto-reply.js'

const dir = mkdtempSync(join(tmpdir(), 'webwhale-model-'))
const calls = []
let answer = '第一段|||第二段|||第三段'
const fakeFetch = async (url, init) => {
  calls.push({ url, body: JSON.parse(init.body), auth: init.headers.authorization })
  return { ok: true, json: async () => ({ choices: [{ message: { content: answer } }] }) }
}
const credentials = { resolve: async () => ({ value: 'sk-test-not-real', source: 'test' }) }

try {
  const chat = createModelChat({ credentials, directory: dir, fetchImpl: fakeFetch, warn: () => {} })
  const one = await chat.reply({ talkerId: '42', name: '测试', text: '在吗', settings: { personaPreset: 'deepseek-whale' } })
  if (one?.text !== '第一段\n第二段\n第三段' || one.source !== 'model') throw new Error('first model reply failed')
  if (!Array.isArray(one.parts) || one.parts.length !== 3) throw new Error('split reply parts failed')
  const two = await chat.reply({ talkerId: '42', name: '测试', text: '第二条', settings: { personaPreset: 'deepseek-whale' } })
  if (two?.text !== '第一段\n第二段\n第三段') throw new Error('second model reply failed')
  const capped = splitReplyParts('一|||二|||三|||四', 3)
  if (capped.length !== 3 || capped[2] !== '三 四') throw new Error('split reply cap failed')
  const enqueued = []
  const fakeStore = { enqueueOutbox: (row) => { enqueued.push(row); return { duplicate: false } } }
  const plan = enqueueReplyParts(fakeStore, { accountId: '9', talkerId: '42', msgId: 'm1', msgAt: 10, parts: ['一', '二', '三'], nextAt: 'now' })
  if (plan.count !== 3 || enqueued.length !== 3) throw new Error('split enqueue count failed')
  if (enqueued[0].msgId !== 'm1:p1' || enqueued[2].target.part !== 3 || enqueued[2].target.total !== 3) throw new Error('split enqueue target failed')
  if (!calls[1].body.messages.some((m) => m.content === '在吗')) throw new Error('second call missing persistent history')
  if (!calls[0].body.messages[0].content.includes('私信对话规则')) throw new Error('system prompt missing')
  if (calls[0].auth !== 'Bearer sk-test-not-real') throw new Error('authorization header missing')
  const noKey = createModelChat({ credentials: { resolve: async () => undefined }, directory: dir, fetchImpl: fakeFetch, warn: () => {} })
  if (await noKey.reply({ talkerId: '43', text: 'hi' }) !== null) throw new Error('missing key must not call model')
  console.log('verify-02-model: PASS')
  console.log(' - dedicated model conversation persists history')
  console.log(' - system prompt includes persona DM rules')
  console.log(' - missing credential returns null (template fallback path)')
} finally {
  rmSync(dir, { recursive: true, force: true })
}
