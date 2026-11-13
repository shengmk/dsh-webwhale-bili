/**
 * Local reply policy. This never sends anything; it only classifies an incoming
 * mention/comment/DM into one of the four local buckets.
 */
const RISKY = /(转账|借钱|银行卡|密码|身份证|政治|自杀|裸聊|约炮|加微信|加v|vx|v信|qq|刷单|返利|链接)/i
const LINK = /(https?:\/\/|www\.|b23\.tv|\bBV[0-9A-Za-z]{10}\b)/i

export function classifyReply({ source = 'comment', fromMid = '', text = '', owners = {}, knownMids = [] } = {}) {
  const normalizedSource = source === 'at' || source === 'dm' ? source : 'comment'
  const activeSource = owners?.activeSource === 'mutual' ? 'mutual' : 'manual'
  const members = Array.isArray(owners?.members) ? owners.members : []
  const manualOwner = members.find((member) => member?.enabled !== false && member?.mid === String(fromMid) && member?.source === activeSource)
  const known = (knownMids || []).map(String).includes(String(fromMid))
  // 互关了就是主人：已知互关与手动主人拥有同一授权级别。
  const owner = Boolean(manualOwner) || known
  const ownerVia = known ? '互关即主人' : '手动主人'
  const body = String(text ?? '')
  const risky = body.length > 300 || RISKY.test(body) || LINK.test(body)

  if (normalizedSource === 'at' && !owner) {
    return { mode: 'ignore', reason: '非主人 @：直接忽略，不进入回复流', owner: false }
  }
  if (owner && !risky) {
    return { mode: 'direct', reason: ownerVia + ' + 低风险：可进入直接回复', owner: true }
  }
  if (owner && risky) {
    return { mode: 'confirm', reason: ownerVia + ' + 高风险：需主人确认后再回', owner: true }
  }
  if (!risky) {
    return { mode: 'review', reason: '非主人 + 低风险：进入审查后回复', owner: false }
  }
  return { mode: 'confirm', reason: '非主人 + 高风险：需主人确认后再回', owner: false }
}
