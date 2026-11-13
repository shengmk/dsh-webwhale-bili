/**
 * Bilibili QR login for the workbench.
 *
 * The QR key, cookies, and refresh material never reach the browser: the client
 * only sees a session id, a QR data URL, a status, and the public account name.
 * Cookies are written to a 0600 file under the plugin data directory.
 */
import { randomUUID } from 'node:crypto'
import { appendFileSync, chmodSync, renameSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const PASSPORT = 'https://passport.bilibili.com'
const INTERVAL = 2000
const TTL = 180000
const TERMINAL = new Set(['success', 'expired', 'cancelled', 'error'])

export class AuthError extends Error {
  constructor(message) {
    super(message)
    this.name = 'AuthError'
  }
}

async function passportRequest(url, { signal, cookie } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15000)
  const abort = () => controller.abort()
  signal?.addEventListener('abort', abort, { once: true })
  try {
    const response = await fetch(url, {
      redirect: 'error',
      signal: controller.signal,
      headers: {
        'user-agent': 'Mozilla/5.0',
        referer: PASSPORT + '/login',
        ...(cookie ? { cookie } : {}),
      },
    })
    if (!response.ok) throw new Error('http ' + response.status)
    const text = await response.text()
    if (text.length > 256 * 1024) throw new Error('response too large')
    const body = JSON.parse(text)
    if (Number(body?.code) !== 0) throw new Error(body?.message || 'bilibili error')
    return { data: body.data, response }
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener?.('abort', abort)
  }
}

function parseCredentials(values) {
  const sessdata = String(values?.sessdata ?? '').trim()
  const biliJct = String(values?.bili_jct ?? '').trim()
  const buvid3 = String(values?.buvid3 ?? '').trim()
  if (sessdata === '' || biliJct === '') throw new AuthError('登录返回缺少必要凭据。')
  return {
    sessdata,
    bili_jct: biliJct,
    ...(buvid3 === '' ? {} : { buvid3 }),
  }
}

function cookieHeader(credentials) {
  return `SESSDATA=${credentials.sessdata}; bili_jct=${credentials.bili_jct}` +
    (credentials.buvid3 ? '; buvid3=' + credentials.buvid3 : '')
}

function setCookiesOf(response) {
  try {
    const list = response.headers.getSetCookie?.()
    if (Array.isArray(list) && list.length > 0) return list
  } catch {}
  const raw = response.headers.get('set-cookie') ?? ''
  if (raw === '') return []
  // Fallback for hosts whose fetch hides getSetCookie(): split at commas that
  // introduce another `name=value` pair, not at expires dates.
  return raw.split(/,(?=\s*[^;,=]+=)/g).map((value) => value.trim()).filter(Boolean)
}

function cookieValue(header, name) {
  const match = String(header).match(new RegExp('(?:^|[;,]\\s*)' + name + '=([^;,\\s]+)', 'i'))
  return match ? match[1] : ''
}

export async function verifyAccount(credentials, { signal } = {}) {
  const { data } = await passportRequest('https://api.bilibili.com/x/web-interface/nav', {
    signal,
    cookie: cookieHeader(credentials),
  })
  if (data?.isLogin !== true || !/^[1-9]\d{0,19}$/.test(String(data?.mid ?? ''))) {
    throw new AuthError('登录验证失败。')
  }
  let name = typeof data.uname === 'string' ? data.uname.slice(0, 200) : 'B站用户'
  for (const secret of Object.values(credentials)) {
    if (secret) name = name.split(secret).join('[redacted]')
  }
  return { mid: String(data.mid), name, authenticated: true, short: name.slice(0, 1) || 'B' }
}

export class QrAuth {
  constructor({ save, render = async (url) => {
    const module = await import('qrcode')
    return module.default.toDataURL(url, { width: 220, margin: 2 })
  }, now = Date.now, warn = () => {} }) {
    this.save = save
    this.render = render
    this.now = now
    this.warn = warn
    this.current = null
    this.nextStart = 0
    this.disposed = false
  }

  state(session) {
    return {
      id: session.id,
      status: session.status,
      expiresAt: session.expiresAt,
      ...(session.status === 'waiting' || session.status === 'scanned' ? { image: session.image } : {}),
      ...(session.account ? { account: session.account } : {}),
      ...(session.error ? { error: session.error } : {}),
    }
  }

  check(session) {
    if (this.disposed || this.current !== session || session.controller.signal.aborted) {
      throw new AuthError('登录流程已失效，请重新扫码。')
    }
    if (this.now() >= session.expiresAt) {
      session.status = 'expired'
      throw new AuthError('二维码已过期，请重新生成。')
    }
  }

  async start() {
    if (this.disposed) throw new AuthError('登录服务已关闭。')
    if (this.now() < this.nextStart) throw new AuthError('请稍等两秒后再生成二维码。')
    this.nextStart = this.now() + INTERVAL
    this.cancel()
    const session = {
      id: randomUUID(), status: 'waiting', controller: new AbortController(),
      expiresAt: this.now() + TTL, nextPoll: this.now() + INTERVAL,
    }
    this.current = session
    try {
      const { data } = await passportRequest(PASSPORT + '/x/passport-login/web/qrcode/generate', {
        signal: session.controller.signal,
      })
      this.check(session)
      let url
      try { url = new URL(data?.url) } catch { throw new AuthError('二维码响应无效。') }
      if (![PASSPORT, 'https://account.bilibili.com'].includes(url.origin) ||
          url.username || url.password ||
          typeof data?.qrcode_key !== 'string' || !/^[A-Za-z0-9_-]{1,256}$/.test(data.qrcode_key)) {
        throw new AuthError('二维码响应无效。')
      }
      session.key = data.qrcode_key
      session.image = await this.render(url.href)
      this.check(session)
      return this.state(session)
    } catch (error) {
      session.status = session.controller.signal.aborted ? 'cancelled' : 'error'
      delete session.key
      delete session.image
      this.warn('qr start failed: ' + String(error?.message || error).slice(0, 300))
      throw error instanceof AuthError ? error : new AuthError('二维码生成失败，请重试。')
    }
  }

  async poll(id) {
    const session = this.current
    if (!session || session.id !== id) throw new AuthError('登录流程已失效，请重新扫码。')
    if (TERMINAL.has(session.status)) return this.state(session)
    if (this.now() >= session.expiresAt) {
      session.status = 'expired'
      session.controller.abort()
      delete session.key
      delete session.image
      return this.state(session)
    }
    if (session.flight) return session.flight
    if (this.now() < session.nextPoll) return this.state(session)
    session.nextPoll = this.now() + INTERVAL
    session.flight = this.pollOnce(session).finally(() => { session.flight = null })
    return session.flight
  }

  async pollOnce(session) {
    try {
      const url = new URL('/x/passport-login/web/qrcode/poll', PASSPORT)
      url.searchParams.set('qrcode_key', session.key)
      const { data, response } = await passportRequest(url, { signal: session.controller.signal })
      this.check(session)
      const code = Number(data?.code)
      if (code === 86101) session.status = 'waiting'
      else if (code === 86090) session.status = 'scanned'
      else if (code === 86038) session.status = 'expired'
      else if (code === 0) {
        const values = {}
        const cookieHeaderText = setCookiesOf(response).join(',')
        for (const [headerName, key] of [['SESSDATA', 'sessdata'], ['bili_jct', 'bili_jct'], ['buvid3', 'buvid3']]) {
          const value = cookieValue(cookieHeaderText, headerName)
          if (value !== '') values[key] = value
        }
        const credentials = parseCredentials(values)
        session.account = await this.save(credentials, {
          signal: session.controller.signal,
          check: () => this.check(session),
        })
        session.status = 'success'
      } else {
        throw new AuthError('无法识别登录状态，请重新扫码。')
      }
    } catch (error) {
      if (!TERMINAL.has(session.status)) {
        session.status = session.controller.signal.aborted ? 'cancelled' : 'error'
        session.error = error instanceof AuthError ? error.message : '登录未保存，请重新扫码。'
        this.warn('qr poll failed: ' + String(error?.message || error).slice(0, 300))
      }
    }
    if (TERMINAL.has(session.status)) {
      delete session.key
      delete session.image
    }
    return this.state(session)
  }

  cancel(id) {
    const session = this.current
    if (!session || (id && session.id !== id)) return { status: 'cancelled' }
    if (!TERMINAL.has(session.status)) session.status = 'cancelled'
    session.controller.abort()
    delete session.key
    delete session.image
    return this.state(session)
  }

  dispose() {
    this.disposed = true
    this.cancel()
  }
}

export function createQrAuth({ store, directory, warn = () => {}, onAccount = () => {}, validateAccount = () => true }) {
  const credentialsPath = join(directory, 'credentials.json')
  const log = (message) => {
    try {
      appendFileSync(join(directory, 'auth.log'), new Date().toISOString() + ' ' + String(message).slice(0, 500) + '\n', 'utf8')
    } catch {}
    try { warn(message) } catch {}
  }
  const save = async (credentials, { signal, check } = {}) => {
    check?.()
    if (store.isKilled?.()) {
      throw Object.assign(new Error('kill switch is on: login state will not be saved'), { code: 'killed' })
    }
    const account = await verifyAccount(credentials, { signal })
    if (!validateAccount(account)) throw new AuthError('该账号槽已绑定其他 B站账号，请新建账号槽或先清空槽位')
    check?.()
    if (store.isKilled?.()) {
      throw Object.assign(new Error('kill switch is on: login state will not be saved'), { code: 'killed' })
    }
    const temp = credentialsPath + '.tmp'
    writeFileSync(temp, JSON.stringify(credentials, null, 2), { encoding: 'utf8', mode: 0o600 })
    try { chmodSync(temp, 0o600) } catch {}
    renameSync(temp, credentialsPath)
    store.setAccount(account)
    try { onAccount(account) } catch {}
    log(`QR login saved for ${account.name}`)
    return account
  }
  return new QrAuth({ save, warn: log })
}
