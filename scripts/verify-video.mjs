import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { createVideoSummary } from '../lib/video-summary.js'

const dir = mkdtempSync(join(tmpdir(), 'ww-video-'))
writeFileSync(join(dir, 'credentials.json'), JSON.stringify({ sessdata: 'fake-sessdata', bili_jct: 'fake-jct' }), 'utf8')

const calls = []
const fetchImpl = async (url) => {
  calls.push(String(url))
  if (String(url).includes('/x/web-interface/view')) {
    return {
      ok: true,
      json: async () => ({
        code: 0,
        data: {
          bvid: 'BV1TestVideo',
          aid: 1,
          title: '测试视频：一条有字幕的视频',
          desc: 'desc',
          duration: 600,
          pic: '',
          owner: { mid: 1, name: '测试UP' },
          pages: [{ cid: 123, page: 1, part: '正片', duration: 600 }],
        },
      }),
    }
  }
  if (String(url).includes('/x/player/v2')) {
    return {
      ok: true,
      json: async () => ({
        code: 0,
        data: {
          subtitle: {
            subtitles: [
              { lan: 'ai-zh', subtitle_url: '//sub.example.test/wrong.json' },
              { lan: 'ai-zh', subtitle_url: '//sub.example.test/a.json' },
            ],
          },
        },
      }),
    }
  }
  if (String(url).includes('wrong.json')) {
    return {
      ok: true,
      json: async () => ({ body: [
        { from: 0, content: '错误视频的字幕' },
        { from: 1587, content: '这条轨比本视频长' },
      ] }),
    }
  }
  if (String(url).includes('sub.example.test')) {
    return {
      ok: true,
      json: async () => ({ body: [
        { from: 0, content: '这是第一句字幕' },
        { from: 590, content: '这是第二句字幕' },
      ] }),
    }
  }
  throw new Error('unexpected URL ' + url)
}

const modelChat = {
  complete: async ({ system, user }) => {
    assert.match(system, /只根据/)
    assert.match(user, /这是第一句字幕/)
    return '【一句话】\n测试总结\n【核心内容】\n- 第一点'
  },
}

const warnings = []
const video = createVideoSummary({ directory: dir, modelChat, fetchImpl, warn: (message) => warnings.push(String(message)) })
const started = await video.start({ url: 'BV1TestVideo', page: 1 })
assert.equal(started.ok, true)
assert.equal(started.job.bvid, 'BV1TestVideo')

let job = null
for (let i = 0; i < 500; i += 1) {
  await new Promise((resolve) => setTimeout(resolve, 10))
  job = video.getJob(started.job.id)
  if (job?.status === 'done' || job?.status === 'error') break
}

assert.equal(job?.status, 'done')
assert.equal(job.source, 'B站 AI 字幕')
assert.match(job.summary, /测试总结/)
assert.doesNotMatch(job.summary, /错误视频/)
assert.ok(warnings.some((line) => /longer than video/.test(line)))
assert.equal(video.listJobs().length, 1)
assert.equal(video.remove(job.id).ok, true)
assert.equal(video.listJobs().length, 0)
assert.ok(calls.some((url) => url.includes('x/player/v2')))
assert.ok(calls.some((url) => url.includes('sub.example.test')))

rmSync(dir, { recursive: true, force: true })
console.log('verify-video: PASS')
console.log(' - view -> subtitle -> model summary')
console.log(' - cached job/list/remove')
