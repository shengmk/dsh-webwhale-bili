import { sendDm } from './bili-write.js'
import { wakeText, sleepText } from './persona-voice.js'

function dayInShanghai() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
}

async function ownerMids(store, bili) {
  const state = store.getState().value
  const self = String(state.account?.mid || '')
  let members = (state.owners.members || []).filter((member) => member?.enabled !== false)
  if (members.length === 0 && bili) {
    try {
      const mutual = await bili.mutual()
      members = (mutual.members || []).map((member) => ({ mid: member.mid, enabled: true }))
    } catch {}
  }
  return members
    .filter((member) => /^[1-9]\d{0,19}$/.test(String(member.mid || '')))
    .map((member) => String(member.mid))
    .filter((mid) => mid !== self)
}

export function startLifecycle({ store, bili = null, directory, warn = () => {}, isCurrentAccount = () => true }) {
  let stopped = false
  let timer = null

  async function send(kind) {
    const state = store.getState().value
    if (state.settings.lifecycleMessages !== true || store.isKilled() || !isCurrentAccount()) return
    const date = dayInShanghai()
    const settings = state.settings
    for (const mid of await ownerMids(store, bili)) {
      if (stopped && kind === 'sleep') { /* shutdown still tries best effort */ }
      const current = store.getLifecycle()[mid] || {}
      if (kind === 'wake' && current.wake === date) continue
      if (kind === 'sleep' && current.sleep === date) continue
      try {
        await sendDm({
          directory,
          toMid: mid,
          text: kind === 'wake' ? wakeText(settings) : sleepText(settings),
          guard: () => !store.isKilled() && isCurrentAccount(),
        })
        store.markLifecycle(mid, kind, date)
      } catch (error) {
        warn('lifecycle ' + kind + ' failed: ' + (error?.message || error))
      }
    }
  }

  timer = setTimeout(() => { send('wake').catch((error) => warn('lifecycle wake failed: ' + error.message)) }, 2500)
  timer.unref?.()

  return {
    async stop() {
      stopped = true
      if (timer) clearTimeout(timer)
      timer = null
      // Do not send a sleep message from teardown. Teardown also happens on
      // reload/disable; unsolicited sends made that unsafe. Sleep is explicit.
    },
    sendWake: () => send('wake'),
    sendSleep: () => send('sleep'),
  }
}
