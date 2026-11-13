import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const scripts = ['verify-bundle.mjs', 'verify-skeleton.mjs', 'verify-store.mjs', 'verify-auth.mjs', 'verify-content.mjs', 'verify-owner.mjs', 'verify-policy.mjs', 'verify-fallback.mjs', 'verify-cu.mjs', 'verify-migration.mjs', 'verify-install.mjs']
const failures = []

for (const script of scripts) {
  const result = spawnSync(process.execPath, [join(root, 'scripts', script)], { stdio: 'inherit' })
  if (result.status !== 0) failures.push(script)
}

const files = ['lib/index.js', 'lib/client.js', 'package.json', 'cordis.patch.yml']
for (const file of files) {
  const text = readFileSync(join(root, file), 'utf8')
  if (/cookie\s*[:=]\s*['"][^'"]+['"]/i.test(text) || /csrf\s*[:=]\s*['"][^'"]+['"]/i.test(text)) {
    failures.push('possible secret in ' + file)
  }
}

if (failures.length > 0) {
  console.error('gate-check: FAIL -> ' + failures.join(', '))
  process.exit(1)
}
console.log('gate-check: PASS')
console.log(' - bundle shape + fake-ctx degradation + content state machine + secret scan')
