/**
 * Authorized Bilibili write bridge. Only called after an explicit user decision.
 * Cookies never leave this process and are never logged.
 */
import { readFileSync, writeFileSync, existsSync, chmodSync } from 'node:fs'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

function readCredentials(directory) {
  const raw = JSON.parse(readFileSync(join(directory, 'credentials.json'), 'utf8').replace(/^\uFEFF/, ''))
  const clean = (value) => String(value ?? '').replace(/^["'\s]+|["'\s]+$/g, '')
  const credentials = { sessdata: clean(raw.sessdata), bili_jct: clean(raw.bili_jct), buvid3: clean(raw.buvid3) }
  if (!credentials.sessdata || !credentials.bili_jct) throw new Error('凭据不完整，请重新扫码登录')
  return credentials
}

function headers(credentials) {
  return {
    cookie: `SESSDATA=${credentials.sessdata}; bili_jct=${credentials.bili_jct}; buvid3=${credentials.buvid3}`,
    'user-agent': UA,
    referer: 'https://www.bilibili.com/',
    origin: 'https://www.bilibili.com',
  }
}

async function jsonFetch(url, options, timeout = 15000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    const response = await fetch(url, { ...options, signal: controller.signal })
    const body = await response.json().catch(() => null)
    return { response, body }
  } finally {
    clearTimeout(timer)
  }
}

async function nav(credentials) {
  const { body } = await jsonFetch('https://api.bilibili.com/x/web-interface/nav', { headers: headers(credentials) })
  if (body?.code !== 0 || body?.data?.isLogin !== true) throw new Error('登录态无效，请重新扫码')
  return body.data
}

function stableDevId(directory) {
  const file = join(directory, 'dev_id')
  try {
    if (existsSync(file)) {
      const value = readFileSync(file, 'utf8').trim()
      if (/^WEB-[0-9A-F-]{20,}$/i.test(value)) return value
    }
  } catch {}
  const value = 'WEB-' + randomUUID().toUpperCase()
  writeFileSync(file, value + '\n', { mode: 0o600 })
  try { chmodSync(file, 0o600) } catch {}
  return value
}

export async function sendDm({ directory, toMid, text, guard }) {
  const credentials = readCredentials(directory)
  const me = await nav(credentials)
  if (typeof guard === 'function' && !guard()) throw new Error('发送前检查失败：已停机或自动回复关闭')
  const body = new URLSearchParams({
    'msg[sender_uid]': String(me.mid),
    'msg[receiver_id]': String(toMid),
    'msg[receiver_type]': '1',
    'msg[msg_type]': '1',
    'msg[msg_status]': '0',
    'msg[timestamp]': String(Math.floor(Date.now() / 1000)),
    'msg[dev_id]': stableDevId(directory),
    'msg[content]': JSON.stringify({ content: String(text) }),
    csrf: credentials.bili_jct,
    csrf_token: credentials.bili_jct,
  })
  const { response, body: result } = await jsonFetch(
    'https://api.vc.bilibili.com/web_im/v1/web_im/send_msg',
    { method: 'POST', headers: { ...headers(credentials), 'content-type': 'application/x-www-form-urlencoded' }, body },
  )
  if (!response.ok || result?.code !== 0) {
    throw new Error('私信发送失败：' + (result?.message || 'HTTP ' + response.status))
  }
  return { ok: true, msgKey: result?.data?.msg_key || null, toMid: String(toMid) }
}

export async function followUser({ directory, toMid }) {
  const credentials = readCredentials(directory)
  const body = new URLSearchParams({
    fid: String(toMid),
    act: '1',
    re_src: '11',
    csrf: credentials.bili_jct,
    csrf_token: credentials.bili_jct,
  })
  const { response, body: result } = await jsonFetch(
    'https://api.bilibili.com/x/relation/modify',
    { method: 'POST', headers: { ...headers(credentials), 'content-type': 'application/x-www-form-urlencoded' }, body },
  )
  if (!response.ok) {
    const error = new Error('关注失败：HTTP ' + response.status)
    error.code = response.status >= 500 || response.status === 429 ? 'unknown' : 'auth'
    throw error
  }
  if (result?.code !== 0) {
    const error = new Error('关注失败：' + (result?.message || 'B站返回失败'))
    error.code = result?.code === -101 || result?.code === -111 ? 'auth' : 'biz'
    throw error
  }
  return { ok: true, toMid: String(toMid) }
}

export async function postComment({ directory, bvid, text, guard }) {
  const credentials = readCredentials(directory)
  const view = await jsonFetch('https://api.bilibili.com/x/web-interface/view?bvid=' + encodeURIComponent(bvid), { headers: headers(credentials) })
  const aid = Number(view.body?.data?.aid ?? 0)
  if (view.body?.code !== 0 || !aid) throw new Error('视频不存在或不可见')
  if (typeof guard === 'function' && !guard()) throw new Error('发送前检查失败：已停机')
  const body = new URLSearchParams({
    oid: String(aid),
    type: '1',
    message: String(text),
    plat: '1',
    csrf: credentials.bili_jct,
    csrf_token: credentials.bili_jct,
  })
  const { response, body: result } = await jsonFetch(
    'https://api.bilibili.com/x/v2/reply/add',
    { method: 'POST', headers: { ...headers(credentials), 'content-type': 'application/x-www-form-urlencoded' }, body },
  )
  if (!response.ok || result?.code !== 0) {
    throw new Error('评论发送失败：' + (result?.message || 'HTTP ' + response.status))
  }
  return { ok: true, rpid: result?.data?.rpid_str || result?.data?.rpid || null, bvid, aid }
}
