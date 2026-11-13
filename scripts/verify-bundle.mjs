import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const client = readFileSync(join(root, 'lib/client.js'), 'utf8')
const host = readFileSync(join(root, 'lib/index.js'), 'utf8')
const patch = readFileSync(join(root, 'cordis.patch.yml'), 'utf8')
const failures = []

function ok(condition, message) {
  if (!condition) failures.push(message)
}

ok(pkg.name === 'dsh-webwhale-bili', 'package name must be dsh-webwhale-bili')
ok(pkg.type === 'module', 'package must be ESM')
ok(pkg.main === 'lib/index.js', 'main must be lib/index.js')
ok(pkg.exports?.['./client'] === './lib/client.js', 'exports["./client"] must point at lib/client.js')
ok(pkg.dsh?.bundle?.patch === './cordis.patch.yml', 'dsh.bundle.patch must be declared')
ok(pkg.dsh?.manifestVersion === 1, 'dsh.manifestVersion must be 1')
ok(pkg.dsh?.client?.platform === 'web', 'dsh.client.platform must be web')
ok(/^>=0\.2\.2-rc\.1 <0\.3\.0$/.test(pkg.engines?.dsh ?? ''), 'engines.dsh must lock 0.2.2 line')
ok(/window\.__ModuleLoader__\.load\(\{\s*id:\s*'dsh-webwhale-bili'/.test(client), 'client must register the module loader factory with the package id')
ok(/factory\s*\(require\)/.test(client), 'client must expose factory(require)')
ok(/require\('react'\)/.test(client), 'client must obtain React from the host baseline')
ok(/name:\s*'dsh-webwhale-bili'/.test(client), 'client factory must return the plugin name')
ok(/inject:\s*\['slots',\s*'locale'\]/.test(client), 'client must inject slots and locale')
ok(/sidebar\.panellist/.test(client), 'client must register sidebar.panellist')
ok(/name:\s*'main'/.test(client), 'client must register main')
ok(/output:\s*\{[\s\S]*?render:\s*\(/.test(host), 'host tool must declare output.render')
ok(/webServer\.register/.test(host), 'host must register the bootstrap route')
ok(/id:\s*webwhale-bili/.test(patch), 'bundle patch must insert webwhale-bili')

for (const forbidden of ['@deepseek-ai/dsh-client-', 'document.cookie', 'iframe', 'XMLHttpRequest']) {
  ok(!client.includes(forbidden), `client must not contain forbidden token: ${forbidden}`)
}
ok(!/fetch\([^)]*bilibili\.com/i.test(client), 'client must not call bilibili APIs directly')
for (const label of ['总览', '养鱼', '待审', '互动', '日记', '体检', '日志', '内容']) {
  ok(client.includes(label), `client must render tab label: ${label}`)
}
ok(!/future:\s*true/.test(client), 'the content tab must no longer be future-disabled')

if (failures.length > 0) {
  console.error('verify-bundle: FAIL')
  for (const failure of failures) console.error(' - ' + failure)
  process.exit(1)
}
console.log('verify-bundle: PASS')
console.log(` - ${pkg.name}@${pkg.version}`)
console.log(` - client ${client.length} bytes; host ${host.length} bytes`)
console.log(' - slots: sidebar.panellist + main; tool output.render present')
