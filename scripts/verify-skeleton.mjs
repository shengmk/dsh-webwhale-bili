import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import vm from 'node:vm'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const code = readFileSync(join(root, 'lib/client.js'), 'utf8')
const failures = []

function ok(condition, message) {
  if (!condition) failures.push(message)
}

function reactStub() {
  class Component {
    constructor(props) { this.props = props; this.state = {} }
    setState(update) { this.state = { ...this.state, ...(typeof update === 'function' ? update(this.state) : update) } }
  }
  return {
    createElement: (type, props, ...children) => ({ type, props, children }),
    Component,
    useState: (initial) => [initial, () => {}],
    useEffect: () => {},
    useRef: (initial) => ({ current: initial }),
  }
}

function loadFactory() {
  let captured = null
  const sandbox = {
    window: { __ModuleLoader__: { load: (config) => { captured = config } } },
    console,
    setTimeout,
    clearTimeout,
    fetch: () => Promise.reject(new Error('offline test')),
    localStorage: { getItem: () => null, setItem: () => {} },
  }
  vm.runInNewContext(code, sandbox, { filename: 'lib/client.js' })
  if (!captured) throw new Error('module loader was not called')
  if (captured.id !== 'dsh-webwhale-bili') throw new Error('wrong module id: ' + captured.id)
  return captured.factory(() => reactStub())
}

function makeCtx(overrides = {}) {
  const registered = []
  const locale = {
    register: () => () => {},
    bind: () => (key) => key,
  }
  const ctx = {
    effect: (fn) => { try { return fn() } catch { return undefined } },
    get: (name) => (name === 'locale' ? locale : undefined),
    locale,
    slots: {
      inject: (name, callback) => {
        if (overrides.missingSlot === name) return undefined
        if (overrides.throwSlot === name) throw new Error('slot unavailable')
        callback()
      },
      register: (definition, component) => {
        registered.push({ definition, component })
        return () => {}
      },
    },
  }
  return { ctx, registered }
}

try {
  const plugin = loadFactory()
  ok(plugin && plugin.name === 'dsh-webwhale-bili', 'factory must return plugin name')
  ok(Array.isArray(plugin.inject) && plugin.inject.includes('slots') && plugin.inject.includes('locale'), 'factory must inject slots + locale')
  ok(typeof plugin.apply === 'function', 'factory must return apply()')

  const a = makeCtx()
  plugin.apply(a.ctx)
  ok(a.registered.some((r) => r.definition.name === 'sidebar.panellist'), 'sidebar.panellist must be registered')
  ok(a.registered.some((r) => r.definition.name === 'main'), 'main must be registered')
  ok(a.registered.every((r) => typeof r.component === 'function'), 'every slot must receive a component')

  const b = makeCtx({ throwSlot: 'sidebar.panellist' })
  let threw = false
  try { plugin.apply(b.ctx) } catch { threw = true }
  ok(!threw, 'a failed sidebar registration must not abort apply()')

  const c = makeCtx({ missingSlot: 'main' })
  threw = false
  try { plugin.apply(c.ctx) } catch { threw = true }
  ok(!threw, 'a missing main slot must not abort apply()')
  ok(c.registered.some((r) => r.definition.name === 'sidebar.panellist'), 'sidebar must survive a missing main slot')

  if (failures.length > 0) {
    console.error('verify-skeleton: FAIL')
    for (const failure of failures) console.error(' - ' + failure)
    process.exit(1)
  }
  console.log('verify-skeleton: PASS')
  console.log(' - module factory loads under a fake window')
  console.log(' - sidebar + main registered; missing/throwing slots degrade safely')
} catch (error) {
  console.error('verify-skeleton: FAIL')
  console.error(' - ' + (error?.stack || error))
  process.exit(1)
}
