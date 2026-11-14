import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const auto = readFileSync(resolve(root, 'lib/auto-reply.js'), 'utf8')
const comment = readFileSync(resolve(root, 'lib/comment-reply.js'), 'utf8')
const write = readFileSync(resolve(root, 'lib/bili-write.js'), 'utf8')

function fail(message) {
  console.error('verify-02-worker-guard: FAIL - ' + message)
  process.exit(1)
}

function between(source, start, end) {
  const a = source.indexOf(start)
  const b = source.indexOf(end, a + start.length)
  if (a < 0 || b < 0) fail('missing block ' + start)
  return source.slice(a, b)
}

const sendDm = between(write, 'export async function sendDm', 'export async function followUser')
if (/\broot\b/.test(sendDm)) fail('sendDm references undefined root')
const follow = between(write, 'export async function followUser', 'export async function postComment')
if (/\broot\b/.test(follow)) fail('followUser references undefined root')

const pumpDm = between(auto, 'async function pumpOutbox', 'function schedule')
if (!/const generation = getGeneration\(\)/.test(pumpDm)) fail('DM pump missing generation scope')
if (!/dmLastSentAt/.test(pumpDm)) fail('DM pump must use its own cooldown')
if (!/lastDmReplyText/.test(pumpDm)) fail('DM pump must use its own duplicate guard')

const pumpComment = between(comment, 'async function pumpCommentOutbox', 'async function tick')
if (!/const generation = getGeneration\(\)/.test(pumpComment)) fail('comment pump missing generation scope')
if (!/commentLastSentAt/.test(pumpComment)) fail('comment pump must use its own cooldown')

console.log('verify-02-worker-guard: PASS')
console.log(' - sendDm/followUser cannot reference undefined root')
console.log(' - DM/comment workers have local generation + independent cooldown')
