/**
 * 审查线：只做放行/待审/拒绝，不生成文案、不直接发送。
 */
export function reviewDecision(result) {
  if (!result) return { status: 'rejected', reason: 'no policy result' }
  if (result.mode === 'ignore') return { status: 'rejected', reason: result.reason || 'ignored' }
  if (result.mode === 'direct') return { status: 'approved', reason: result.reason || 'low risk' }
  return { status: 'review_pending', reason: result.reason || 'needs human review' }
}

export function applyReview({ store, candidateId, result } = {}) {
  const decision = reviewDecision(result)
  const item = store.decideCandidate(candidateId, decision.status, decision.reason)
  return { ...decision, item }
}

export function decideUserCandidate({ store, candidateId, decision } = {}) {
  if (decision !== 'approved' && decision !== 'rejected') throw Object.assign(new Error('decision must be approved or rejected'), { code: 'bad-request' })
  return store.decideCandidate(candidateId, decision, 'user decision')
}
