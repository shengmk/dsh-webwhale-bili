/**
 * Same-origin JSON routes for the embedded workbench.
 * Every request goes through the host's connection trust fence first.
 */
import { appendFileSync } from 'node:fs'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { classifyReply } from './policy.js'
import { followUser } from './bili-write.js'
import { classifyComputerAction } from './cu-policy.js'
import { checkDeps, installQrcode } from './deps.js'
import { listPersonas } from './personas.js'
const MAX_BODY = 64 * 1024

function sendJson(res, status, body) {
  try {
    res.writeHead(status, {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    })
    res.end(JSON.stringify(body))
  } catch (error) {
    try { console.warn('[dsh-webwhale-bili] response failed:', error?.message || error) } catch {}
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0
    const chunks = []
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > MAX_BODY) {
        reject(Object.assign(new Error('body too large'), { code: 'bad-request' }))
        req.resume()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

const ERROR_CODES = new Set(['bad-request', 'not-found', 'approval_stale', 'killed'])

function statusFor(error) {
  const code = error?.code
  if (code === 'killed') return 423
  if (code === 'approval_stale') return 409
  if (code === 'not-found') return 404
  return 400
}

function errorBody(error) {
  return {
    ok: false,
    error: {
      code: ERROR_CODES.has(error?.code) ? error.code : 'bad-request',
      message: error?.message || 'request failed',
    },
  }
}

// Every mutating RPC except risk.kill / risk.revive must fail closed while the
// kill switch is on. The store repeats the check; the route guard also covers
// settings and reply approvals.
const WRITE_METHODS = new Set([
  'settings.set',
  'pending.approve',
  'pending.reject',
  'content.create',
  'content.update',
  'content.submit',
  'content.approve',
  'content.reject',
  'owner.set',
  'reply.queue',
  'reply.decide',
  'follow.request',
  'follow.decide',
  'follow.execute',
  'accounts.create',
  'accounts.switch',
  'accounts.qr.start',
  'accounts.qr.poll',
  'accounts.qr.cancel',
  'deps.install',
  'computer.request',
  'computer.complete',
  'computer.approve',
  'computer.authorize',
  'risk.revive.request',
  'risk.revive.confirm',
  'auth.qr.start',
  'auth.qr.poll',
  'auth.qr.cancel',
])

// All state-mutating operations additionally require the owner principal. The
// signed browser cookie is the human boundary; model tools cannot mint it.
// Killing is the safe direction and stays reachable through the trust fence even
// if a host omits browserPeer; reviving remains owner-only.
const OWNER_METHODS = new Set([...WRITE_METHODS, 'risk.revive.request', 'risk.revive.confirm', 'computer.authorize'])

export function createRoutes(store, options = {}) {
  const version = options.version || '0.1.0'
  const connection = options.connection
  const auth = options.auth
  const bili = options.bili
  const accounts = options.accounts
  const isCurrentAccount = options.isCurrentAccount
  const onAccountSwitch = options.onAccountSwitch
  const onFollowExecuted = options.onFollowExecuted
  const warn = options.warn || (() => {})
  const computerTokens = new Map()

  return async function handler(req, res) {
    // Fail closed: a request without a host connection identity is never served.
    let rejection
    try {
      rejection = connection?.requestRejection?.(req)
    } catch {
      rejection = 403
    }
    if (rejection !== undefined && rejection !== null && rejection !== false) {
      return sendJson(res, typeof rejection === 'number' ? rejection : 403, { ok: false, error: { code: 'forbidden', message: 'forbidden' } })
    }
    if (!connection || typeof connection.requestRejection !== 'function') {
      return sendJson(res, 403, { ok: false, error: { code: 'forbidden', message: 'forbidden' } })
    }

    if (store === null || store === undefined) {
      return sendJson(res, 503, { ok: false, error: { code: 'bad-request', message: 'store unavailable' } })
    }
    if (typeof store.isKilled !== 'function') {
      return sendJson(res, 503, { ok: false, error: { code: 'bad-request', message: 'store cannot enforce kill switch' } })
    }

    async function isOwnerRequest() {
      try {
        // The browser Peer is the owner's shared peer; model/tool peers are not.
        if (connection.browserPeer?.principal?.kind === 'owner') return true
        let admission = null
        let admitError = ''
        if (typeof connection.admit === 'function') {
          try { admission = await connection.admit(req) } catch (error) { admitError = error?.message || String(error) }
        }
        const ok = admission?.peer?.principal?.kind === 'owner'
        if (!ok) {
          try {
            appendFileSync(join(store.directory, 'rpc.log'), JSON.stringify({
              at: new Date().toISOString(),
              hasBrowserPeer: Boolean(connection.browserPeer),
              browserPrincipal: connection.browserPeer?.principal?.kind ?? null,
              hasAdmit: typeof connection.admit === 'function',
              admission: admission === null ? null : { rejection: admission.rejection ?? null, principal: admission.peer?.principal?.kind ?? null },
              admitError: admitError.slice(0, 200),
            }) + '\n', 'utf8')
          } catch {}
        }
        return ok
      } catch {
        return false
      }
    }

    const url = new URL(req.url || '/', 'http://localhost')
    const path = url.pathname.replace(/\/+$/, '')

    if (req.method === 'GET' && path === '/dsh-webwhale/api/bootstrap') {
      return sendJson(res, 200, { ...store.getState(), routeVersion: version })
    }

    if (req.method === 'POST' && path === '/dsh-webwhale/api/rpc') {
      let body
      try {
        const text = await readBody(req)
        body = JSON.parse(text || '{}')
      } catch (error) {
        return sendJson(res, 400, errorBody(error))
      }
      if (body === null || typeof body !== 'object' || Array.isArray(body) ||
          typeof body.method !== 'string' || body.method === '' ||
          (body.params !== undefined && (body.params === null || typeof body.params !== 'object' || Array.isArray(body.params)))) {
        return sendJson(res, 400, { ok: false, error: { code: 'bad-request', message: 'invalid rpc envelope' } })
      }
      const method = body?.method
      const params = body?.params ?? {}
      if (OWNER_METHODS.has(method) && !(await isOwnerRequest())) {
        return sendJson(res, 403, { ok: false, error: { code: 'forbidden', message: 'owner browser session required' } })
      }
      if (WRITE_METHODS.has(method) && typeof isCurrentAccount === 'function') {
        let current = true
        try { current = isCurrentAccount() } catch { current = false }
        if (!current) {
          return sendJson(res, 409, { ok: false, error: { code: 'bad-request', message: 'account switched; reload plugin before writing' } })
        }
      }
      try {
        if (WRITE_METHODS.has(method) && method !== 'risk.revive.request' && method !== 'risk.revive.confirm' && store.isKilled?.()) {
          throw Object.assign(new Error('kill switch is on: all write operations are rejected'), { code: 'killed' })
        }
        if (method === 'state.get') return sendJson(res, 200, store.getState())
        if (method === 'settings.set') return sendJson(res, 200, store.setSettings(params))
        if (method === 'pending.approve') return sendJson(res, 200, store.approve(params?.id))
        if (method === 'pending.reject') return sendJson(res, 200, store.reject(params?.id))
        if (method === 'content.create') return sendJson(res, 200, store.createContent(params))
        if (method === 'content.update') return sendJson(res, 200, store.updateContent(params))
        if (method === 'content.submit') return sendJson(res, 200, store.submitApproval(params?.id, params?.version))
        if (method === 'content.approve') return sendJson(res, 200, store.approveContent(params?.id, params?.version))
        if (method === 'content.reject') return sendJson(res, 200, store.rejectContent(params?.id, params?.reason, params?.version))
        if (method === 'owner.get') return sendJson(res, 200, { ok: true, value: store.getOwners() })
        if (method === 'owner.set') return sendJson(res, 200, store.setOwners(params))
        if (method === 'accounts.list') return sendJson(res, 200, { ok: true, value: accounts ? accounts.list() : null })
        if (method === 'accounts.status') {
          let stale = false
          try { stale = typeof isCurrentAccount === 'function' ? !isCurrentAccount() : false } catch { stale = true }
          return sendJson(res, 200, { ok: true, value: { stale } })
        }
        if (method === 'accounts.create') {
          if (!accounts) throw Object.assign(new Error('accounts unavailable'), { code: 'bad-request' })
          return sendJson(res, 200, { ok: true, value: accounts.create({ name: params?.name }) })
        }
        if (method === 'accounts.switch') {
          if (!accounts) throw Object.assign(new Error('accounts unavailable'), { code: 'bad-request' })
          const value = accounts.switch(params?.id)
          try { onAccountSwitch?.(params?.id) } catch {}
          return sendJson(res, 200, { ok: true, value })
        }
        if (method === 'accounts.qr.start') {
          const auth = accounts?.authFor?.(params?.id)
          if (!auth) throw Object.assign(new Error('account auth unavailable'), { code: 'bad-request' })
          return sendJson(res, 200, { ok: true, value: await auth.start() })
        }
        if (method === 'accounts.qr.poll') {
          const auth = accounts?.authFor?.(params?.id)
          if (!auth) throw Object.assign(new Error('account auth unavailable'), { code: 'bad-request' })
          return sendJson(res, 200, { ok: true, value: await auth.poll(String(params?.sessionId ?? '')) })
        }
        if (method === 'accounts.qr.cancel') {
          const auth = accounts?.authFor?.(params?.id)
          if (!auth) throw Object.assign(new Error('account auth unavailable'), { code: 'bad-request' })
          auth.cancel(String(params?.sessionId ?? ''))
          return sendJson(res, 200, { ok: true, value: true })
        }
        if (method === 'reply.list') return sendJson(res, 200, { ok: true, value: store.getReplyQueue() })
        if (method === 'reply.queue') return sendJson(res, 200, { ok: true, value: store.queueReply(params) })
        if (method === 'reply.decide') return sendJson(res, 200, store.decideReply(params?.id, params?.action))
        if (method === 'follow.list') return sendJson(res, 200, { ok: true, value: store.getFollowRequests() })
        if (method === 'follow.request') return sendJson(res, 200, store.requestFollow(params))
        if (method === 'follow.decide') return sendJson(res, 200, store.decideFollow(params?.id, params?.action))
        if (method === 'follow.execute') {
          const id = String(params?.id ?? '')
          const mid = String(params?.mid ?? '')
          if (!/^[1-9]\d{0,19}$/.test(mid)) throw Object.assign(new Error('follow mid required'), { code: 'bad-request' })
          const configured = Number(store.getState().value.settings.followDailyLimit)
          const limit = Number.isFinite(configured) && configured >= 0 ? Math.floor(configured) : 3
          if (store.followsToday() >= limit) throw Object.assign(new Error('daily follow limit reached'), { code: 'bad-request' })
          const item = store.beginFollow(id)
          if (item.mid !== mid) {
            store.finishFollow(id, false)
            throw Object.assign(new Error('follow mid does not match request'), { code: 'bad-request' })
          }
          try {
            const value = await followUser({ directory: store.directory, toMid: mid })
            store.finishFollow(id, true)
            try { onFollowExecuted?.(mid) } catch {}
            return sendJson(res, 200, { ok: true, value })
          } catch (error) {
            const outcome = error?.code === 'unknown' ? 'unknown' : (/^关注失败：|凭据|未登录|cookie|credentials|SESSDATA|auth/i.test(String(error?.message || '')) || error?.code === 'auth' ? 'failed' : 'unknown')
            store.finishFollow(id, false, outcome)
            throw error
          }
        }
        if (method === 'reply.preview') {
          return sendJson(res, 200, {
            ok: true,
            value: classifyReply({
              source: params?.source,
              fromMid: params?.fromMid,
              text: params?.text,
              owners: store.getOwners(),
            }),
          })
        }
        if (method === 'computer.preview') {
          return sendJson(res, 200, { ok: true, value: classifyComputerAction({ action: params?.action, label: params?.label }) })
        }
        if (method === 'computer.authorize') {
          const action = String(params?.action ?? '')
          const label = String(params?.label ?? '')
          const decision = classifyComputerAction({ action, label })
          if (decision.mode !== 'allow') throw Object.assign(new Error('dangerous/review action requires per-action confirmation'), { code: 'bad-request' })
          const token = randomUUID()
          const expiresAt = Date.now() + 60000
          computerTokens.set(token, { action, label, expiresAt })
          return sendJson(res, 200, { ok: true, value: { token, expiresAt: new Date(expiresAt).toISOString(), scope: 'safe' } })
        }
        if (method === 'computer.consume') {
          const token = String(params?.token ?? '')
          const entry = computerTokens.get(token)
          computerTokens.delete(token)
          if (!entry || Date.now() > entry.expiresAt) throw Object.assign(new Error('computer authorization expired'), { code: 'bad-request' })
          return sendJson(res, 200, { ok: true, value: { action: entry.action, label: entry.label } })
        }
        if (method === 'computer.list') return sendJson(res, 200, { ok: true, value: store.getComputerActions().map(({ token, ...item }) => item) })
        if (method === 'computer.request') return sendJson(res, 200, store.requestComputerAction(params))
        if (method === 'computer.complete') return sendJson(res, 200, store.completeComputerAction(params?.id, params?.ok === true))
        if (method === 'computer.approve') return sendJson(res, 200, store.decideComputerAction(params?.id, params?.ok === true))
        if (method === 'deps.check') return sendJson(res, 200, { ok: true, value: checkDeps() })
        if (method === 'personas.list') return sendJson(res, 200, { ok: true, value: listPersonas() })
        if (method === 'deps.install') {
          const name = String(params?.name ?? '')
          if (name !== 'qrcode') throw Object.assign(new Error('unsupported dependency'), { code: 'bad-request' })
          return sendJson(res, 200, { ok: true, value: await installQrcode() })
        }
        if (method === 'risk.kill') return sendJson(res, 200, store.kill())
        if (method === 'risk.revive.request') return sendJson(res, 200, store.requestRevive())
        if (method === 'risk.revive.confirm') return sendJson(res, 200, store.revive(params?.confirm, params?.challenge))
        if (method === 'health.run') return sendJson(res, 200, store.getState())
        if (method === 'auth.qr.start') {
          if (!auth) throw Object.assign(new Error('auth unavailable'), { code: 'bad-request' })
          return sendJson(res, 200, { ok: true, value: await auth.start() })
        }
        if (method === 'auth.qr.poll') {
          if (!auth) throw Object.assign(new Error('auth unavailable'), { code: 'bad-request' })
          return sendJson(res, 200, { ok: true, value: await auth.poll(String(params?.id ?? '')) })
        }
        if (method === 'auth.qr.cancel') {
          if (!auth) throw Object.assign(new Error('auth unavailable'), { code: 'bad-request' })
          return sendJson(res, 200, { ok: true, value: auth.cancel(String(params?.id ?? '')) })
        }
        if (method === 'bili.snapshot') {
          if (!bili) throw Object.assign(new Error('bili reader unavailable'), { code: 'bad-request' })
          return sendJson(res, 200, { ok: true, value: await bili.snapshot({ force: params?.force === true }) })
        }
        if (method === 'bili.comments') {
          if (!bili) throw Object.assign(new Error('bili reader unavailable'), { code: 'bad-request' })
          return sendJson(res, 200, { ok: true, value: await bili.comments({ bvid: params?.bvid }) })
        }
        if (method === 'bili.mutual') {
          if (!bili) throw Object.assign(new Error('bili reader unavailable'), { code: 'bad-request' })
          return sendJson(res, 200, { ok: true, value: await bili.mutual() })
        }
        return sendJson(res, 404, { ok: false, error: { code: 'not-found', message: 'unknown method' } })
      } catch (error) {
        warn(`rpc ${String(method)} failed: ${error?.message || error}`)
        return sendJson(res, statusFor(error), errorBody(error))
      }
    }

    return sendJson(res, 404, { ok: false, error: { code: 'not-found', message: 'unknown route' } })
  }
}
