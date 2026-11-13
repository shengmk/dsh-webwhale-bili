/**
 * Run an independent Codex review over this plugin.
 *
 * Usage:
 *   node scripts/codex-review.mjs [--target .] [--out ../评审-codex-03.md]
 *
 * Codex runs with `--sandbox read-only` and a fresh non-interactive session; the
 * last message is persisted to the requested markdown path. This script never
 * edits source and never talks to Bilibili.
 */
import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const pluginRoot = dirname(here)
const workspace = dirname(pluginRoot)

function arg(name, fallback) {
  const index = process.argv.indexOf(name)
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback
}

const target = resolve(arg('--target', pluginRoot))
const out = resolve(arg('--out', join(workspace, '评审-codex-03.md')))
const rolePrompt = readFileSync(join(workspace, 'agents', 'codex-reviewer.md'), 'utf8')
const prompt = [
  rolePrompt,
  '',
  '## 本次任务',
  '审查目标目录：' + target,
  '重点：A3–A6 内容/审批/kill switch、RPC 信任栅栏、只读边界、负向用例。',
  '请先读目标目录的 lib/store.js、lib/routes.js、lib/index.js、lib/client.js、scripts/gate-check.mjs 与相关 verify 脚本。',
  '只读审查，不要修改任何文件。最终把报告写到 --out 指定的文件内容里（脚本会落盘）。',
  '结论必须是 PASS / PASS-WITH-FIXES / FAIL；FIXES 必须给文件:行与具体修法。',
].join('\n')

const tempDir = mkdtempSync(join(tmpdir(), 'ww-codex-'))
const lastFile = join(tempDir, 'last.md')
const command = process.platform === 'win32' ? 'codex.cmd' : 'codex'
const result = spawnSync(command, [
  'exec',
  '--sandbox', 'read-only',
  '--skip-git-repo-check',
  '-C', target,
  '-o', lastFile,
  '-',
], {
  input: prompt,
  encoding: 'utf8',
  shell: process.platform === 'win32',
  timeout: 300000,
  maxBuffer: 20 * 1024 * 1024,
})

try {
  if (result.error) throw result.error
  if (result.status !== 0) {
    const detail = (result.stderr || result.stdout || '').trim().slice(-2000)
    throw new Error('codex exec exit=' + result.status + (detail ? '\n' + detail : ''))
  }
  const report = readFileSync(lastFile, 'utf8').trim()
  if (report === '') throw new Error('codex returned an empty final message')
  writeFileSync(out, report + '\n', 'utf8')
  console.log('codex-review: WROTE ' + out)
  console.log('codex-review: ' + report.split(/\r?\n/, 1)[0])
} catch (error) {
  console.error('codex-review: FAIL')
  console.error(String(error?.message || error))
  process.exit(1)
} finally {
  try { rmSync(tempDir, { recursive: true, force: true }) } catch {}
}
