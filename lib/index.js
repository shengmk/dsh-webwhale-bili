/**
 * dsh-webwhale-bili — host half.
 *
 * Minimal compatible skeleton:
 *  - one diagnostic tool (`webwhale_compat_report`) with a required output.render
 *  - one same-origin RPC surface backed by a single host-owned store
 *
 * The page is a client bundle (`lib/client.js`); this file never renders UI.
 */
import { createStore } from './store.js'
import { createRoutes } from './routes.js'
import { createQrAuth } from './auth.js'
import { createBiliReader } from './bili.js'
import { startAutoReply } from './auto-reply.js'
import { startLifecycle } from './lifecycle.js'
import { startCommentReply } from './comment-reply.js'
import { activeDirectory, activeState, listAccounts, createAccount, setActiveAccount, updateActiveAccount, accountById, updateAccount } from './accounts.js'

export const name = 'dsh-webwhale-bili'
export const inject = ['tools']
const VERSION = '0.1.0'

export function apply(ctx) {
  const warn = (message) => {
    try { console.warn('[dsh-webwhale-bili] ' + message) } catch {}
  }

  let store = null
  try {
    store = createStore(activeDirectory())
  } catch (error) {
    warn('store initialization failed: ' + (error?.message || error))
  }

  let auth = null
  let accountGeneration = 0
  if (store !== null) {
    try {
      auth = createQrAuth({
        store,
        directory: store.directory,
        warn,
        validateAccount: (account) => {
          const current = listAccounts().accounts.find((item) => item.active)
          return !current?.mid || current.mid === String(account.mid)
        },
        onAccount: (account) => { updateActiveAccount(account); accountGeneration += 1 },
      })
    } catch (error) {
      warn('QR auth initialization failed: ' + (error?.message || error))
    }
  }

  const bili = store === null ? null : createBiliReader({ directory: store.directory, warn })
  let startupSwitchSeq = -1
  try { startupSwitchSeq = activeState().switchSeq } catch { startupSwitchSeq = -1 }
  const accountAuths = new Map()
  const authForAccount = (id) => {
    if (accountAuths.has(id)) return accountAuths.get(id)
    const account = accountById(id)
    if (!account) return null
    const accountStore = createStore(account.dir)
    const accountAuth = createQrAuth({
      store: accountStore,
      directory: account.dir,
      warn,
      validateAccount: (next) => {
        const current = accountById(id)
        return !current?.mid || current.mid === String(next.mid)
      },
      onAccount: (next) => { updateAccount(id, next); accountGeneration += 1 },
    })
    accountAuths.set(id, accountAuth)
    return accountAuth
  }
  const currentAccount = () => {
    try {
      if (store === null) return false
      const state = activeState()
      return state.dir === store.directory && state.switchSeq === startupSwitchSeq
    } catch { return false }
  }
  const autoReply = store === null || bili === null ? null : startAutoReply({ store, bili, directory: store.directory, warn, isCurrentAccount: currentAccount, getGeneration: () => accountGeneration })
  if (autoReply) ctx.effect(() => () => autoReply.stop())
  const commentReply = store === null || bili === null ? null : startCommentReply({ store, bili, directory: store.directory, warn, isCurrentAccount: currentAccount, getGeneration: () => accountGeneration })
  if (commentReply) ctx.effect(() => () => commentReply.stop())
  const lifecycle = store === null ? null : startLifecycle({ store, bili, directory: store.directory, warn, isCurrentAccount: currentAccount })
  if (lifecycle) ctx.effect(() => () => { lifecycle.stop() })

  // Diagnostic tool: proves the host half loaded and the tool contract is valid.
  try {
    ctx.effect(() => {
      const dispose = ctx.tools.register({
        name: 'webwhale_compat_report',
        description:
          'Report the dsh-webwhale-bili skeleton status: tab count, host version, route path, persistence store, and whether the page is in read-only demo mode.',
        parameters: {
          type: 'object',
          properties: {},
          additionalProperties: false,
        },
        output: {
          schema: {
            type: 'object',
            properties: {
              ok: { type: 'boolean' },
              version: { type: 'string' },
              tabs: { type: 'number' },
              route: { type: 'string' },
              store: { type: 'string' },
              pending: { type: 'number' },
              contents: { type: 'number' },
              killed: { type: 'boolean' },
              readOnly: { type: 'boolean' },
            },
            additionalProperties: true,
          },
          render: (args) => [
            {
              type: 'text',
              text: `dsh-webwhale-bili ${args?.version ?? VERSION}: ${args?.tabs ?? 8} tabs, store=${args?.store ?? 'unknown'}, contents=${args?.contents ?? 0}, killed=${args?.killed === true}, read-only=${args?.readOnly !== false}`,
            },
          ],
        },
        async execute() {
          const state = store?.getState?.()
          return {
            ok: true,
            version: VERSION,
            tabs: state?.value?.tabs?.length ?? 8,
            route: '/dsh-webwhale/api/rpc',
            store: store === null ? 'unavailable' : (store.sqlite ? 'sqlite' : 'json'),
            pending: state?.value?.pending?.length ?? 0,
            contents: state?.value?.contents?.length ?? 0,
            killed: state?.value?.killed === true,
            readOnly: true,
          }
        },
      })
      return () => {
        if (typeof dispose === 'function') dispose()
      }
    }, 'dsh-webwhale-bili: compat tool')
  } catch (error) {
    warn('tool registration failed: ' + (error?.message || error))
  }

  // RPC route: requires both webServer and connection; missing either means the
  // page keeps its offline demo data rather than serving an unauthenticated API.
  try {
    ctx.inject(['webServer', 'connection'], (scoped) => {
      scoped.effect(() => {
        const handler = createRoutes(store, {
          version: VERSION,
          connection: scoped.get?.('connection'),
          auth,
          bili,
          accounts: { list: listAccounts, create: createAccount, switch: setActiveAccount, authFor: authForAccount },
          isCurrentAccount: currentAccount,
          onAccountSwitch: () => { accountGeneration += 1 },
          onFollowExecuted: () => { try { autoReply?.invalidateMutual?.() } catch {} },
          warn,
        })
        const dispose = scoped.webServer.register({
          kind: 'prefix',
          path: '/dsh-webwhale',
          handler,
        })
        return () => {
          if (typeof dispose === 'function') dispose()
        }
      }, 'dsh-webwhale-bili: rpc route')
    })
  } catch (error) {
    warn('route unavailable: ' + (error?.message || error))
  }
}
