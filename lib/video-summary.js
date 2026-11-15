/**
 * B站视频总结工作流（养鱼 · 可选依赖）。
 *
 * 优先级：
 *  1. 账号可见字幕（含 AI 字幕）——最快、最准；
 *  2. yt-dlp 下载音频 + faster-whisper 本地转录；
 *  3. 没有字幕也没有转录依赖时，明确失败，不凭标题编内容。
 *
 * 所有中间文件保存在插件数据目录，不写 cookie / SESSDATA 到日志。
 */
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'
import { spawn } from 'node:child_process'

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
const PYTHON = process.env.WW_PYTHON || 'python'
const MAX_TRANSCRIPT = 24000
const MAX_JOBS = 30
const MODULE_DIR = dirname(fileURLToPath(import.meta.url))

const SUMMARY_SYSTEM = [
  '你是中文视频内容整理助手。你只根据用户提供的字幕/转录整理，不补充材料里没有的事实。',
  '如果转录有明显听错、缺字或口语重复，可以概括，但不要把不确定的内容写成确定事实。',
  '不要输出空泛的“本视频介绍了……”；直接给信息。',
  '输出纯文本，使用下面小标题，不加 Markdown 代码块：',
  '【一句话】',
  '【核心内容】3–6 条，每条一行',
  '【时间轴】4–8 个关键节点；只有材料带时间戳时才写，格式 mm:ss 主题',
  '【关键结论 / 可执行步骤】',
  '【适合谁看 / 注意】',
].join('\n')

function safeReadJson(path, fallback) {
  try {
    if (!existsSync(path)) return fallback
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch {
    return fallback
  }
}

function safeWriteJson(path, value) {
  mkdirSync(dirname(path), { recursive: true })
  const tmp = path + '.tmp'
  writeFileSync(tmp, JSON.stringify(value, null, 2), 'utf8')
  renameSync(tmp, path)
}

function fmtTime(seconds) {
  const total = Math.max(0, Math.floor(Number(seconds) || 0))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`
}

function parseBvid(text) {
  const raw = String(text || '').trim()
  const direct = raw.match(/(BV[0-9A-Za-z]{10})/)
  if (direct) return direct[1]
  const av = raw.match(/\/video\/av(\d+)/i)
  if (av) return 'av' + av[1]
  return ''
}

function decodeEntities(text) {
  return String(text || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

function cueText(cue) {
  return decodeEntities(String(cue?.content || '')).replace(/\s+/g, ' ').trim()
}

export function createVideoSummary({ directory, credentials = null, modelChat = null, warn = () => {}, fetchImpl = globalThis.fetch } = {}) {
  const root = join(directory || '.', 'video-summary')
  const jobsPath = join(root, 'jobs.json')
  let jobsCache = null
  let depCache = null
  let depCacheAt = 0
  const running = new Map()

  function jobs() {
    if (!jobsCache) {
      const parsed = safeReadJson(jobsPath, { version: 1, jobs: [] })
      jobsCache = Array.isArray(parsed?.jobs) ? parsed : { version: 1, jobs: [] }
      let changed = false
      for (const job of jobsCache.jobs) {
        if (['queued', 'fetching', 'downloading', 'transcribing', 'summarizing'].includes(job.status) && !running.has(job.id)) {
          job.status = 'error'
          job.progress = '已中断'
          job.error = '任务在插件重启或进程中断后停止；请重新生成。'
          job.finishedAt = new Date().toISOString()
          changed = true
        }
      }
      if (changed) saveJobs()
    }
    return jobsCache
  }

  function saveJobs() {
    jobsCache.jobs = jobsCache.jobs.slice(0, MAX_JOBS)
    safeWriteJson(jobsPath, jobsCache)
  }

  function listJobs() {
    return jobs().jobs.slice().sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
  }

  function getJob(id) {
    return jobs().jobs.find((job) => job.id === String(id || '')) || null
  }

  function patchJob(id, patch) {
    const job = getJob(id)
    if (!job) return null
    Object.assign(job, patch || {}, { updatedAt: new Date().toISOString() })
    saveJobs()
    return job
  }

  function cookies() {
    try {
      const file = join(directory || '.', 'credentials.json')
      if (!existsSync(file)) return ''
      const data = JSON.parse(readFileSync(file, 'utf8'))
      const parts = []
      if (data?.sessdata) parts.push('SESSDATA=' + data.sessdata)
      if (data?.bili_jct) parts.push('bili_jct=' + data.bili_jct)
      return parts.join('; ')
    } catch {
      return ''
    }
  }

  async function biliGet(url, withCookie = true) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 20000)
    try {
      const headers = {
        'user-agent': UA,
        referer: 'https://www.bilibili.com/',
        accept: 'application/json, text/plain, */*',
      }
      const cookie = withCookie ? cookies() : ''
      if (cookie) headers.cookie = cookie
      const response = await fetchImpl(url, { headers, signal: controller.signal })
      if (!response.ok) throw new Error('B站 HTTP ' + response.status)
      const payload = await response.json()
      if (payload?.code !== 0) throw new Error('B站接口 ' + payload?.code + '：' + (payload?.message || '未知错误'))
      return payload.data
    } finally {
      clearTimeout(timer)
    }
  }

  async function resolveBvid(url) {
    const raw = String(url || '').trim()
    const direct = parseBvid(raw)
    if (direct) return direct
    if (!/^https?:\/\//i.test(raw)) throw new Error('请粘贴 B站视频链接或 BV 号')
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 15000)
    try {
      const response = await fetchImpl(raw, {
        redirect: 'follow',
        headers: { 'user-agent': UA, accept: 'text/html,application/xhtml+xml' },
        signal: controller.signal,
      })
      const finalUrl = String(response?.url || '')
      const hit = parseBvid(finalUrl)
      if (hit) return hit
      throw new Error('这个链接里没有解析到 BV 号')
    } finally {
      clearTimeout(timer)
    }
  }

  async function fetchInfo(bvid) {
    const query = /^av\d+$/i.test(bvid) ? 'aid=' + encodeURIComponent(bvid.slice(2)) : 'bvid=' + encodeURIComponent(bvid)
    const data = await biliGet('https://api.bilibili.com/x/web-interface/view?' + query)
    return {
      bvid: data.bvid,
      aid: data.aid,
      title: String(data.title || '').trim(),
      desc: String(data.desc || '').trim(),
      duration: Number(data.duration || 0),
      cover: String(data.pic || ''),
      owner: { mid: data.owner?.mid, name: data.owner?.name },
      pages: (data.pages || []).map((page) => ({ cid: page.cid, page: page.page, part: page.part, duration: page.duration })),
    }
  }

  async function fetchSubtitle(bvid, cid, expected = 0) {
    const data = await biliGet('https://api.bilibili.com/x/player/v2?bvid=' + encodeURIComponent(bvid) + '&cid=' + encodeURIComponent(cid))
    const subtitles = data?.subtitle?.subtitles || []
    if (!Array.isArray(subtitles) || subtitles.length === 0) return null
    // 同一个视频可能同时有 zh-CN 和 ai-zh；有时其中一条只覆盖前几分钟。
    // 逐条取回，选覆盖到最晚时间的那条，而不是盲目优先 zh-CN。
    const ordered = [
      ...subtitles.filter((item) => item.lan === 'zh-CN'),
      ...subtitles.filter((item) => item.lan === 'ai-zh'),
      ...subtitles.filter((item) => item.lan !== 'zh-CN' && item.lan !== 'ai-zh'),
    ]
    let best = null
    for (const chosen of ordered.slice(0, 4)) {
      if (!chosen?.subtitle_url) continue
      const url = String(chosen.subtitle_url).startsWith('//') ? 'https:' + chosen.subtitle_url : String(chosen.subtitle_url)
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 20000)
      try {
        const response = await fetchImpl(url, { headers: { 'user-agent': UA, referer: 'https://www.bilibili.com/' }, signal: controller.signal })
        if (!response.ok) continue
        const body = await response.json()
        const cues = Array.isArray(body?.body) ? body.body : []
        const lines = cues.map((cue) => ({ at: Number(cue.from || 0), text: cueText(cue) })).filter((cue) => cue.text)
        if (lines.length === 0) continue
        const candidate = { lang: chosen.lan || '', lines, lastAt: lines[lines.length - 1].at }
        // 字幕轨有时会混入别的视频（末条时间超过本视频时长）；这种轨不能用于总结。
        if (Number(expected) > 120 && candidate.lastAt > Number(expected) + 30) {
          warn('video subtitle longer than video: ' + Math.round(candidate.lastAt) + 's > ' + Math.round(Number(expected)) + 's')
          continue
        }
        if (!best || candidate.lastAt > best.lastAt || (candidate.lastAt === best.lastAt && candidate.lines.length > best.lines.length)) best = candidate
      } catch {
        // 换下一条字幕继续
      } finally {
        clearTimeout(timer)
      }
    }
    if (!best) return null
    return { lang: best.lang, lines: best.lines }
  }

  function runCommand(command, args, { timeoutMs = 30000, env = {} } = {}) {
    return new Promise((resolve) => {
      let child
      try {
        child = spawn(command, args, { windowsHide: true, env: { ...process.env, ...env } })
      } catch (error) {
        resolve({ ok: false, code: -1, stdout: '', stderr: error?.message || String(error) })
        return
      }
      let stdout = ''
      let stderr = ''
      let settled = false
      const done = (result) => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        resolve(result)
      }
      const timer = setTimeout(() => {
        try { child.kill() } catch {}
        done({ ok: false, code: -1, stdout, stderr: stderr + '\n命令超时' })
      }, timeoutMs)
      child.stdout?.on('data', (chunk) => { stdout += String(chunk) })
      child.stderr?.on('data', (chunk) => { stderr += String(chunk) })
      child.on('error', (error) => done({ ok: false, code: -1, stdout, stderr: error?.message || String(error) }))
      child.on('close', (code) => done({ ok: code === 0, code, stdout, stderr }))
    })
  }

  async function inspectDeps(force = false) {
    if (!force && depCache && Date.now() - depCacheAt < 60000) return depCache
    const [ffmpeg, ytdlp, whisper] = await Promise.all([
      runCommand('ffmpeg', ['-version'], { timeoutMs: 5000 }),
      runCommand(PYTHON, ['-m', 'yt_dlp', '--version'], { timeoutMs: 8000 }),
      runCommand(PYTHON, ['-c', 'import faster_whisper, ctranslate2; print(faster_whisper.__version__)'], { timeoutMs: 8000 }),
    ])
    depCache = {
      ffmpeg: { ok: ffmpeg.ok, version: (ffmpeg.stdout.split(/\r?\n/)[0] || '').slice(0, 120) },
      ytdlp: { ok: ytdlp.ok, version: (ytdlp.stdout.trim().split(/\r?\n/).pop() || '').slice(0, 80) },
      whisper: { ok: whisper.ok, version: (whisper.stdout.trim().split(/\r?\n/).pop() || '').slice(0, 80) },
      python: PYTHON,
      installHint: 'python -m pip install --user yt-dlp faster-whisper',
    }
    depCacheAt = Date.now()
    return depCache
  }

  async function downloadAudio(job, info, page) {
    const deps = await inspectDeps()
    if (!deps.ytdlp.ok) throw new Error('没有 yt-dlp；先安装可选依赖，或换一个有字幕的视频')
    const out = join(root, job.id + '.%(ext)s')
    const cookie = cookies()
    const args = ['-m', 'yt_dlp', '--no-playlist', '--no-warnings', '-f', 'ba/b', '-o', out]
    if (cookie) args.push('--add-header', 'Cookie:' + cookie)
    if (page > 1) args.push('--playlist-items', String(page))
    args.push(`https://www.bilibili.com/video/${info.bvid}`)
    patchJob(job.id, { status: 'downloading', progress: '下载音频…' })
    const result = await runCommand(PYTHON, args, { timeoutMs: 600000 })
    if (!result.ok) throw new Error('音频下载失败：' + (result.stderr || result.stdout || 'yt-dlp 退出 ' + result.code).slice(-400))
    const files = ['m4a', 'mp3', 'webm', 'opus', 'aac'].map((ext) => join(root, job.id + '.' + ext)).filter((file) => existsSync(file))
    if (files.length === 0) throw new Error('yt-dlp 没有产出音频文件')
    return files[0]
  }

  async function transcribeAudio(job, audioPath) {
    const deps = await inspectDeps()
    if (!deps.whisper.ok) throw new Error('没有 faster-whisper；先安装可选依赖，或换一个有字幕的视频')
    // 插件安装目录和用户数据目录不同；脚本按模块位置定位。
    const candidates = [join(MODULE_DIR, '..', 'scripts', 'transcribe-audio.py'), join(process.cwd(), 'scripts', 'transcribe-audio.py')]
    const scriptPath = candidates.find((file) => existsSync(file))
    if (!scriptPath) throw new Error('找不到 scripts/transcribe-audio.py')
    patchJob(job.id, { status: 'transcribing', progress: '本地语音识别…首次会下载模型' })
    const result = await runCommand(PYTHON, [scriptPath, audioPath], { timeoutMs: 1800000, env: { WW_WHISPER_MODEL: process.env.WW_WHISPER_MODEL || 'small' } })
    if (!result.ok) throw new Error('语音识别失败：' + (result.stderr || result.stdout || '转录进程退出 ' + result.code).slice(-500))
    const lines = []
    for (const line of String(result.stdout || '').split(/\r?\n/)) {
      if (!line.trim()) continue
      try {
        const item = JSON.parse(line)
        if (item?.text) lines.push({ at: Number(item.start || 0), text: String(item.text).trim() })
      } catch {}
    }
    if (lines.length === 0) throw new Error('语音识别没有返回文本')
    return { lang: 'whisper', lines }
  }

  function transcriptText(lines) {
    return lines.map((line) => '[' + fmtTime(line.at) + '] ' + line.text).join('\n').slice(0, MAX_TRANSCRIPT)
  }

  async function summarize(info, page, transcript, source) {
    if (!modelChat?.complete) throw new Error('模型不可用；检查 DeepSeek API key')
    const body = [
      `视频标题：${info.title}`,
      `UP主：${info.owner?.name || ''}`,
      `分P：${page.part || ''}（${fmtTime(page.duration || info.duration)}）`,
      `字幕来源：${source}`,
      '',
      '字幕/转录：',
      transcriptText(transcript),
    ].join('\n')
    const answer = await modelChat.complete({ system: SUMMARY_SYSTEM, user: body, maxTokens: 2400, temperature: 0.2 })
    if (!answer) throw new Error('模型总结失败')
    return answer
  }

  async function runJob(job) {
    const started = Date.now()
    let audioPath = ''
    try {
      patchJob(job.id, { status: 'fetching', progress: '读取视频信息…' })
      const info = await fetchInfo(job.bvid)
      const pageNo = Math.min(Math.max(1, Number(job.page) || 1), Math.max(1, info.pages.length))
      const page = info.pages.find((item) => Number(item.page) === pageNo) || info.pages[0] || { cid: 0, page: 1, part: info.title, duration: info.duration }
      patchJob(job.id, { title: info.title, owner: info.owner?.name || '', cover: info.cover, duration: info.duration, page: pageNo, part: page.part, progress: '检查字幕…' })
      let transcript = null
      let source = ''
      try {
        transcript = await fetchSubtitle(job.bvid, page.cid, page.duration || info.duration)
        if (transcript) source = transcript.lang === 'ai-zh' ? 'B站 AI 字幕' : 'B站字幕（' + transcript.lang + '）'
        const lastAt = transcript?.lines?.[transcript.lines.length - 1]?.at || 0
        const expected = Number(page.duration || info.duration || 0)
        if (transcript && expected > 120 && lastAt < expected - 90 && lastAt / expected < 0.8) {
          warn('video subtitle partial: ' + Math.round(lastAt) + '/' + expected + 's')
          transcript = null
          source = ''
        }
        // B站 AI 字幕偶尔会返回别的视频的轨，长度也可能刚好接近；标题里的英文专名是最后一道校验。
        if (transcript && source.startsWith('B站 AI 字幕')) {
          const titleTokens = String(info.title || '').match(/[A-Za-z][A-Za-z0-9+.#_-]{2,}/g) || []
          const joined = transcript.lines.map((line) => line.text).join(' ').toLowerCase()
          if (titleTokens.length > 0 && !titleTokens.some((token) => joined.includes(token.toLowerCase()))) {
            warn('video subtitle does not match title: ' + transcript.lines.length + ' lines')
            transcript = null
            source = ''
          }
        }
      } catch (error) {
        warn('video subtitle failed: ' + (error?.message || error))
      }
      if (!transcript) {
        audioPath = await downloadAudio(job, info, pageNo)
        transcript = await transcribeAudio(job, audioPath)
        source = 'faster-whisper 本地转录'
      }
      const transcriptFile = join(root, job.id + '.txt')
      writeFileSync(transcriptFile, transcriptText(transcript.lines), 'utf8')
      patchJob(job.id, { status: 'summarizing', progress: '整理总结…', source, transcriptLines: transcript.lines.length, transcriptPath: transcriptFile })
      const summary = await summarize(info, page, transcript.lines, source)
      patchJob(job.id, {
        status: 'done',
        progress: '完成',
        summary,
        transcriptPath: transcriptFile,
        elapsedMs: Date.now() - started,
        finishedAt: new Date().toISOString(),
      })
    } catch (error) {
      patchJob(job.id, {
        status: 'error',
        progress: '失败',
        error: String(error?.message || error).slice(0, 1200),
        elapsedMs: Date.now() - started,
        finishedAt: new Date().toISOString(),
      })
    } finally {
      if (audioPath) {
        try { rmSync(audioPath, { force: true }) } catch {}
      }
      running.delete(job.id)
    }
  }

  async function start({ url, page = 1, settings = {} } = {}) {
    const bvid = await resolveBvid(url)
    const pageNo = Math.max(1, Number(page) || 1)
    const existing = jobs().jobs.find((job) => job.bvid === bvid && Number(job.page) === pageNo && job.status === 'done')
    if (existing) return { ok: true, cached: true, job: existing }
    const active = jobs().jobs.find((job) => job.bvid === bvid && Number(job.page) === pageNo && ['queued', 'fetching', 'downloading', 'transcribing', 'summarizing'].includes(job.status))
    if (active) return { ok: true, cached: false, job: active }
    const job = {
      id: 'v-' + randomUUID(),
      bvid,
      page: pageNo,
      url: String(url || ''),
      status: 'queued',
      progress: '排队中…',
      title: '',
      owner: '',
      cover: '',
      duration: 0,
      part: '',
      source: '',
      summary: '',
      error: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    jobs().jobs.unshift(job)
    saveJobs()
    running.set(job.id, true)
    runJob(job).catch((error) => warn('video job failed: ' + (error?.message || error)))
    return { ok: true, cached: false, job }
  }

  function remove(id) {
    const job = getJob(id)
    if (!job) return { ok: false, reason: 'not found' }
    if (running.has(id)) return { ok: false, reason: 'job is running' }
    try { if (job.transcriptPath) rmSync(job.transcriptPath, { force: true }) } catch {}
    jobsCache.jobs = jobs().jobs.filter((item) => item.id !== job.id)
    saveJobs()
    return { ok: true }
  }

  return { start, listJobs, getJob, remove, inspectDeps }
}
