import { classifyComputerAction } from '../lib/cu-policy.js'

const failures = []
const ok = (condition, message) => { if (!condition) failures.push(message) }

ok(classifyComputerAction({ action: 'click', label: '打开视频' }).mode === 'allow', 'navigation should be allowed')
ok(classifyComputerAction({ action: 'click', label: '点赞' }).mode === 'allow', 'like should be allowed by humanize policy')
ok(classifyComputerAction({ action: 'click', label: '发送私信' }).mode === 'confirm', 'dm send must confirm')
ok(classifyComputerAction({ action: 'click', label: '关注' }).mode === 'confirm', 'follow must confirm')
ok(classifyComputerAction({ action: 'click', label: '删除评论' }).mode === 'confirm', 'delete must confirm')
ok(classifyComputerAction({ action: 'type', label: '搜索框' }).mode === 'review', 'typing should be reviewed')
ok(classifyComputerAction({ action: 'click', label: '' }).mode === 'confirm', 'empty label must fail closed')
ok(classifyComputerAction({ action: 'click', label: 'Follow' }).mode === 'confirm', 'english follow must confirm')
ok(classifyComputerAction({ action: 'click', label: '取消收藏' }).mode === 'confirm', 'cancel favorite must confirm')
ok(classifyComputerAction({ action: 'click', label: '取消点赞' }).mode === 'confirm', 'cancel like must confirm')
ok(classifyComputerAction({ action: 'paste', label: '搜索框' }).mode === 'review', 'paste must be reviewed')

if (failures.length > 0) {
  console.error('verify-cu: FAIL')
  for (const failure of failures) console.error(' - ' + failure)
  process.exit(1)
}
console.log('verify-cu: PASS')
console.log(' - navigation/like allow, send/follow/delete confirm, type review')
