import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createRequire } from 'node:module'
import vm from 'node:vm'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const reactRoot = process.env.WW_REACT_ROOT || join(process.env.TEMP || process.env.TMP || 'C:/Windows/Temp', 'ww-react')
const req = createRequire(join(reactRoot, 'package.json'))
const React = req('react')
const { renderToStaticMarkup } = req('react-dom/server')
const code = readFileSync(join(root, 'lib/client.js'), 'utf8')

let captured
const sandbox = {
  window: { __ModuleLoader__: { load: (config) => { captured = config } } },
  console,
  setTimeout,
  clearTimeout,
  fetch: () => Promise.reject(new Error('offline probe')),
  localStorage: { getItem: () => null, setItem: () => {} },
}
vm.runInNewContext(code, sandbox, { filename: 'lib/client.js' })
if (!captured) throw new Error('no module capture')
const factory = captured.factory((name) => {
  if (name === 'react') return React
  throw new Error('unexpected require: ' + name)
})

const registered = []
const locale = { register: () => () => {}, bind: () => (key) => key }
const ctx = {
  effect: (fn) => fn(),
  get: (name) => (name === 'locale' ? locale : undefined),
  locale,
  slots: {
    inject: (_name, callback) => callback(),
    register: (definition, component) => {
      registered.push({ definition, component })
      return () => {}
    },
  },
}

factory.apply(ctx)
const main = registered.find((entry) => entry.definition.name === 'main')
if (!main) throw new Error('main slot not registered')
const html = renderToStaticMarkup(React.createElement(main.component, {}))
if (!html.includes('总控制台') || !html.includes('养鱼') || !html.includes('创作') || !html.includes('设置') || !html.includes('待接入 1')) {
  throw new Error('home cards missing from rendered HTML')
}
console.log('probe-render: PASS')
console.log(' - rendered bytes:', html.length)
console.log(' - home:', ['总控制台', '养鱼', '创作', '设置', '待接入 1'].filter((label) => html.includes(label)).join(' / '))
