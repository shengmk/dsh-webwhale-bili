import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { parseDmMessage } from '../lib/bili.js'
import { listAssets, promoteAsset, saveRemoteImage } from '../lib/assets.js'

const dir = mkdtempSync(join(tmpdir(), 'webwhale-image-'))
const store = { directory: dir }

try {
  const text = parseDmMessage({ msg_key: 'm1', sender_uid: 42, msg_type: 1, content: JSON.stringify({ content: '你好' }), timestamp: 100 })
  if (text.text !== '你好' || text.image !== null || text.sender !== '42') throw new Error('text DM parse failed')
  const image = parseDmMessage({ msg_key: 'm2', sender_uid: 42, msg_type: 2, content: JSON.stringify({ url: 'http://i0.hdslb.com/bfs/a.png', width: 300, height: 200, imageType: 'png', size: 1234 }), timestamp: 101 })
  if (!image.image || image.image.url !== 'https://i0.hdslb.com/bfs/a.png' || image.image.width !== 300) throw new Error('image DM parse failed')
  const emoji = parseDmMessage({ msg_key: 'm3', sender_uid: 42, msg_type: 6, content: JSON.stringify({ url: 'https://i1.hdslb.com/bfs/b.png' }), timestamp: 102 })
  if (!emoji.image || emoji.image.url !== 'https://i1.hdslb.com/bfs/b.png') throw new Error('custom emoji parse failed')
  const rejected = parseDmMessage({ msg_key: 'm4', sender_uid: 42, msg_type: 2, content: JSON.stringify({ url: 'https://evil.example/a.png' }), timestamp: 103 })
  if (rejected.image !== null) throw new Error('non-B站 image host must be rejected')

  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64')
  const saved = await saveRemoteImage(store, 'emoji-incoming', {
    url: 'https://i0.hdslb.com/bfs/test.png',
    name: 'dm-test',
    meta: { talkerId: '42', msgId: 'm2', width: 1, height: 1 },
    fetchImpl: async () => ({ ok: true, headers: { get: () => 'image/png' }, arrayBuffer: async () => png }),
  })
  if (saved.status !== 'pending' || !saved.id) throw new Error('remote image save failed')
  const incoming = listAssets(store, 'emoji-incoming')
  if (incoming.length !== 1 || !String(incoming[0].dataUrl).startsWith('data:image/png;base64,')) throw new Error('incoming asset missing data URL')
  const promoted = promoteAsset(store, saved.id)
  if (!promoted.id || listAssets(store, 'emoji').length !== 1 || listAssets(store, 'emoji-incoming').length !== 0) throw new Error('promote asset failed')
  let blocked = false
  try {
    await saveRemoteImage(store, 'emoji-incoming', { url: 'https://evil.example/a.png', fetchImpl: async () => { throw new Error('must not fetch') } })
  } catch { blocked = true }
  if (!blocked) throw new Error('untrusted host must be rejected before fetch')
  console.log('verify-02-image: PASS')
  console.log(' - text/image/custom emoji DM parsed')
  console.log(' - B站-only image host enforced')
  console.log(' - incoming image saved as pending and promoted to emoji library')
} finally {
  rmSync(dir, { recursive: true, force: true })
}
