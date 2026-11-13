/**
 * Local Computer Use executor bridge. Claims one approved action atomically,
 * refuses after kill, and never retries an executing/unknown action.
 */
import { createStore } from '../lib/store.js'
import { classifyComputerAction } from '../lib/cu-policy.js'
import { activeDirectory } from '../lib/accounts.js'
import { spawnSync } from 'node:child_process'

const directory = process.env.WW_DIR || activeDirectory()
const store = createStore(directory)
if (store.getState().value.settings.computerExperimental !== true) {
  console.log('computer-exec: refused, Computer Use experimental is disabled')
  process.exit(1)
}
if (store.isKilled()) {
  console.log('computer-exec: refused, kill switch is on')
  process.exit(1)
}
const action = store.claimApprovedComputerAction()

if (!action) {
  console.log('computer-exec: no approved action')
  process.exit(0)
}
if (action.action !== 'scroll' || /(关注|取关|follow|unfollow)/i.test(action.label)) {
  store.completeComputerAction(action.id, false)
  console.log('computer-exec: refused, only scroll actions are enabled while Computer Use is experimental')
  process.exit(1)
}
const policy = classifyComputerAction({ action: action.action, label: action.label })
if (policy.mode !== 'allow' && !((action.risk === 'danger' || action.risk === 'confirm') && action.confirmedAt)) {
  store.completeComputerAction(action.id, false)
  console.log('computer-exec: refused, policy=' + policy.mode)
  process.exit(1)
}
if (store.isKilled()) {
  store.completeComputerAction(action.id, false)
  console.log('computer-exec: refused, kill switch is on')
  process.exit(1)
}

function powershell(script) {
  const result = spawnSync('powershell', ['-NoProfile', '-Command', script], { encoding: 'utf8', timeout: 15000 })
  return { code: result.status, stdout: result.stdout || '', stderr: result.stderr || '' }
}

let result
if (action.action === 'scroll') {
  result = powershell('Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait("{PGDN}")')
} else if (action.action === 'click') {
  result = powershell(`Add-Type @'
using System;
using System.Runtime.InteropServices;
public class W { [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y); [DllImport("user32.dll")] public static extern void mouse_event(uint f, uint dx, uint dy, uint d, UIntPtr e); }
'@; [W]::SetCursorPos(${Number(action.x) || 0}, ${Number(action.y) || 0}); [W]::mouse_event(2,0,0,0,[UIntPtr]::Zero); [W]::mouse_event(4,0,0,0,[UIntPtr]::Zero)`)
} else {
  store.completeComputerAction(action.id, false)
  console.log('computer-exec: unsupported action ' + action.action)
  process.exit(1)
}

store.completeComputerAction(action.id, result.code === 0)
console.log(JSON.stringify({ id: action.id, action: action.action, label: action.label, ok: result.code === 0, stderr: result.stderr.slice(0, 200) }))
