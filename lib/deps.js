import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { spawn } from 'node:child_process'

const require = createRequire(import.meta.url)
const PLUGIN_ROOT = dirname(dirname(fileURLToPath(import.meta.url)))

function qrcodeReady() {
  try { require.resolve('qrcode'); return true } catch { return false }
}

function findFfmpeg() {
  const candidates = []
  for (const dir of String(process.env.PATH ?? '').split(';')) {
    if (dir.trim() !== '') candidates.push(join(dir.trim(), process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg'))
  }
  candidates.push(
    'D:/Tools/ffmpeg/bin/ffmpeg.exe',
    join(homedir(), 'scoop', 'shims', 'ffmpeg.exe'),
    join(process.env.LOCALAPPDATA ?? '', 'Microsoft', 'WinGet', 'Links', 'ffmpeg.exe'),
  )
  return candidates.find((candidate) => existsSync(candidate)) || ''
}

export function checkDeps() {
  const ffmpeg = findFfmpeg()
  return {
    ok: qrcodeReady() && ffmpeg !== '',
    rows: [
      { name: 'qrcode', ready: qrcodeReady(), detail: qrcodeReady() ? '已安装' : '缺失：扫码登录依赖', action: 'install-qrcode' },
      { name: 'ffmpeg', ready: ffmpeg !== '', detail: ffmpeg || '缺失：抽帧/封面处理不可用', action: 'guide-ffmpeg' },
      { name: 'node', ready: true, detail: process.version, action: '' },
    ],
  }
}

function run(command, args) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { cwd: PLUGIN_ROOT, windowsHide: true, shell: process.platform === 'win32' })
    let output = ''
    const timer = setTimeout(() => {
      try { child.kill() } catch {}
      resolve({ ok: false, output: '安装超时（120 秒），请检查网络/代理' })
    }, 120000)
    child.stdout?.on('data', (chunk) => { output += chunk })
    child.stderr?.on('data', (chunk) => { output += chunk })
    child.on('error', (error) => { clearTimeout(timer); resolve({ ok: false, output: error?.message || 'npm 启动失败' }) })
    child.on('close', (code) => {
      clearTimeout(timer)
      resolve({ ok: code === 0 && qrcodeReady(), output: output.slice(-2000) })
    })
  })
}

export async function installQrcode() {
  if (qrcodeReady()) return { ok: true, message: 'qrcode 已安装' }
  const command = process.platform === 'win32' ? 'npm.cmd' : 'npm'
  const result = await run(command, ['install', '--omit=dev', '--no-audit', '--no-fund'])
  if (!result.ok) return { ok: false, message: 'qrcode 安装失败：' + result.output }
  return { ok: true, message: 'qrcode 已安装' }
}
