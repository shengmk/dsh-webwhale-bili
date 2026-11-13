/**
 * Sequential Computer Use watch loop. Each tick claims at most one approved
 * action through computer-exec.mjs; pending danger actions stay pending.
 */
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
let running = true
process.on('SIGINT', () => { running = false })
process.on('SIGTERM', () => { running = false })

async function tick() {
  const result = spawnSync(process.execPath, [join(here, 'computer-exec.mjs')], { encoding: 'utf8', timeout: 30000 })
  const output = (result.stdout || '').trim()
  if (output && !output.includes('no approved action')) console.log(new Date().toISOString() + ' ' + output)
  if (result.stderr) console.error(result.stderr.slice(0, 400))
}

while (running) {
  await tick()
  await new Promise((resolve) => setTimeout(resolve, 2000))
}
console.log('computer-watch: stopped')
