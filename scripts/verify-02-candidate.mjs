import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createStore } from '../lib/store.js'
import { proposeCandidate } from '../lib/ai-workflow.js'
import { reviewDecision, applyReview } from '../lib/review-workflow.js'

const failures = []
const ok = (condition, message) => { if (!condition) failures.push(message) }
const dir = mkdtempSync(join(tmpdir(), 'ww-candidate-'))

try {
  const store = createStore(dir)
  const reply = proposeCandidate({ store, text: '做一下自我介绍吧', settings: { personaPreset: 'deepseek-whale', roleName: '鲸鱼娘' } })
  ok(reply.includes('鲸鱼娘'), 'AI candidate must answer self-intro')
  const created = store.createCandidate({ accountId: '1', source: 'comment', talkerId: '2', msgId: 'cm1', bvid: 'BV1GJ411x7h7', root: '9', parent: '9', reply })
  ok(created.item && created.duplicate === false, 'candidate must be created')
  const duplicate = store.createCandidate({ accountId: '1', source: 'comment', talkerId: '2', msgId: 'cm1', bvid: 'BV1GJ411x7h7', reply })
  ok(duplicate.duplicate === true, 'candidate must dedupe by msg key')
  const reviewed = applyReview({ store, candidateId: created.item.id, result: { mode: 'confirm', reason: 'needs review' } })
  ok(reviewed.status === 'review_pending', 'confirm must become review_pending')
  ok(store.getCandidate(created.item.id).status === 'review_pending', 'candidate status must persist')
  ok(reviewDecision({ mode: 'direct' }).status === 'approved', 'direct must approve')
  ok(reviewDecision({ mode: 'ignore' }).status === 'rejected', 'ignore must reject')
  if (failures.length > 0) {
    console.error('verify-02-candidate: FAIL')
    for (const failure of failures) console.error(' - ' + failure)
    process.exit(1)
  }
  console.log('verify-02-candidate: PASS')
  console.log(' - AI candidate + review decision + candidate persistence')
} catch (error) {
  console.error('verify-02-candidate: FAIL')
  console.error(' - ' + (error?.stack || error))
  process.exit(1)
} finally { try { rmSync(dir, { recursive: true, force: true }) } catch {} }
