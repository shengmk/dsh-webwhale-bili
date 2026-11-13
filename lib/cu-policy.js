const DANGER = /(发送|发布|投币|关注|取关|取消|撤|删除|拉黑|举报|支付|购买|充值|开播|下播|私信|评论|弹幕|上传|改标题|改封面|授权|转账|paste|send|publish|follow|unfollow|unlike|dislike|remove|cancel|delete|pay|payment|transfer|authorize|upload)/i
const SAFE = /(打开|滚动|查看|返回|点赞|收藏|播放|搜索|导航|open|scroll|view|back|like|play|search)/i
const ALLOWED_ACTIONS = new Set(['click', 'scroll', 'read', 'observe', 'hover', 'type', 'paste', 'enter'])

export function classifyComputerAction({ action = 'click', label = '' } = {}) {
  const text = String(label ?? '').trim()
  if (text === '') return { risk: 'danger', mode: 'confirm', reason: '无标签动作：默认拒绝，必须确认' }
  if (!ALLOWED_ACTIONS.has(String(action))) return { risk: 'unknown', mode: 'confirm', reason: '未知动作类型：默认确认' }
  if (DANGER.test(text)) return { risk: 'danger', mode: 'confirm', reason: '危险操作：必须由主人弹窗确认' }
  if (action === 'type' || action === 'paste' || action === 'enter') {
    return { risk: 'write', mode: 'review', reason: '写入/粘贴/回车：记录后执行' }
  }
  if (SAFE.test(text)) return { risk: 'safe', mode: 'allow', reason: '只读/导航：可直接执行' }
  return { risk: 'unknown', mode: 'confirm', reason: '未知动作：默认确认后再执行' }
}
