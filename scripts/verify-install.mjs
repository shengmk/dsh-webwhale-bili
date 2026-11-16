import { spawnSync } from 'node:child_process'
import { readFileSync, existsSync } from 'node:fs'

const failures = []
const ok = (condition, message) => { if (!condition) failures.push(message) }
const pkg = JSON.parse(readFileSync('package.json', 'utf8'))

ok(pkg.name === 'dsh-webwhale-bili', 'package name')
ok(typeof pkg.version === 'string' && pkg.version.length > 0, 'package version')
ok(pkg.license === 'MIT', 'MIT license metadata')
ok(pkg.engines?.dsh?.includes('0.2.2-rc.1'), 'DSH engine range')
ok(pkg.dsh?.bundle?.patch === './cordis.patch.yml', 'bundle patch contract')
ok(pkg.dependencies?.qrcode, 'qrcode declared')
ok(existsSync('LICENSE'), 'LICENSE file exists')
ok(existsSync('.gitignore'), '.gitignore exists')
ok(existsSync('MIGRATION.md'), 'MIGRATION.md exists')

const packed = spawnSync('npm', ['pack', '--dry-run', '--json'], { encoding: 'utf8', shell: process.platform === 'win32', timeout: 120000 })
ok(packed.status === 0, 'npm pack --dry-run succeeds')
if (packed.status === 0) {
  const result = JSON.parse(packed.stdout)
  const files = (result[0]?.files || []).map((file) => file.path)
  ok(files.some((file) => file === 'lib/index.js'), 'package includes lib/index.js')
  ok(files.some((file) => file === 'cordis.patch.yml'), 'package includes bundle patch')
  ok(!files.some((file) => /(^|\/)node_modules|credentials\.json|state\.(db|json)|\.env/.test(file)), 'package excludes secrets/state/node_modules')
}

if (failures.length > 0) {
  console.error('verify-install: FAIL')
  for (const failure of failures) console.error(' - ' + failure)
  process.exit(1)
}
console.log('verify-install: PASS')
console.log(' - package metadata, license, files, npm pack, no secrets/state')
