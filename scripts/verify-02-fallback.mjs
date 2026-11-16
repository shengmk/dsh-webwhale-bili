import assert from 'node:assert/strict'
import { fallbackAck } from '../lib/auto-reply.js'

const id = '7700000000000000000'
assert.match(fallbackAck(id, '你醒了吗'), /刚醒/)
assert.match(fallbackAck(id, '刚才的回复不太好，我问你醒没醒，你回答听到了。'), /刚才那句/)
assert.match(fallbackAck(id, '[图片]'), /图/)
assert.doesNotMatch(fallbackAck(id, '随便说一句'), /听到啦/)
assert.equal(fallbackAck(id, '随便说一句'), fallbackAck(id, '随便说一句'))
console.log('verify-02-fallback: PASS')
console.log(' - wake question gets a wake answer')
console.log(' - complaint gets a correction')
console.log(' - image gets an image-specific answer')
console.log(' - generic fallback is not the old “听到啦”')
