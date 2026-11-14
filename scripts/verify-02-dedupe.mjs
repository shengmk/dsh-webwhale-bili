import { burstKeyFor, isBurstDuplicate } from '../lib/auto-reply.js'

const now = 1_800_000_000_000
const textKey = burstKeyFor('  在吗  ')
if (textKey !== 'text:在吗') throw new Error('text burst key normalization failed')
if (burstKeyFor('在吗', { url: 'https://i0.hdslb.com/a.png' }) !== 'image:https://i0.hdslb.com/a.png') throw new Error('image burst key failed')
if (!isBurstDuplicate({ lastBurstKey: textKey, lastBurstAt: now - 1000 }, textKey, now)) throw new Error('duplicate should be detected')
if (isBurstDuplicate({ lastBurstKey: textKey, lastBurstAt: now - 11 * 60 * 1000 }, textKey, now)) throw new Error('old duplicate must expire')
if (isBurstDuplicate({ lastBurstKey: textKey, lastBurstAt: now - 1000 }, 'text:别的话', now)) throw new Error('different text is not duplicate')
if (isBurstDuplicate({}, textKey, now)) throw new Error('missing state is not duplicate')

console.log('verify-02-dedupe: PASS')
console.log(' - identical text in 10 minutes is answered once')
console.log(' - identical image URL is answered once')
console.log(' - different text and expired window are not deduped')
