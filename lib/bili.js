/**
 * Read-only Bilibili bridge.
 *
 * This module is the only place in dsh-webwhale-bili allowed to call
 * bilibili.com. It performs GETs only: nav (who am I) and the "回复我的"
 * inbox (threads that mention this account). No cookies are logged or returned
 * to the client; only a public account label and rendered reply text/video URL.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createHash } from 'node:crypto'

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
const TIMEOUT = 15000
const MIXIN = [46,47,18,2,53,8,23,32,15,50,10,31,58,3,45,35,27,43,5,49,33,9,42,19,29,28,14,39,12,38,41,13,37,48,7,16,24,55,40,61,26,17,0,1,60,51,30,4,22,25,54,21,56,59,6,63,57,62,11,36,20,34,44,52]
let lastBiliAt = 0
let blockedUntil = 0
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export function biliCooldownRemaining() {
  return Math.max(0, Math.ceil((blockedUntil - Date.now()) / 1000))
}

function signWbi(params, images) {
  const keyOf = (value) => String(value).split('/').at(-1).split('.')[0]
  const raw = keyOf(images?.img_url ?? '') + keyOf(images?.sub_url ?? '')
  if (raw.length !== 64) throw new BiliError('WBI 签名密钥缺失')
  const key = MIXIN.map((index) => raw[index]).join('').slice(0, 32)
  const values = { ...params, wts: Math.floor(Date.now() / 1000) }
  const query = Object.keys(values).sort().map((name) => `${encodeURIComponent(name)}=${encodeURIComponent(String(values[name]).replace(/[!'()*]/g, ''))}`).join('&')
  return `${query}&w_rid=${createHash('md5').update(query + key).digest('hex')}`
}

class BiliError extends Error {
  constructor(message) {
    super(message)
    this.name = 'BiliError'
  }
}

function cookieHeader(credentials) {
  const parts = []
  if (credentials.sessdata) parts.push('SESSDATA=' + credentials.sessdata)
  if (credentials.bili_jct) parts.push('bili_jct=' + credentials.bili_jct)
  if (credentials.buvid3) parts.push('buvid3=' + credentials.buvid3)
  return parts.join('; ')
}

async function biliGet(url, credentials, signal) {
  if (Date.now() < blockedUntil) {
    const seconds = Math.max(1, Math.ceil((blockedUntil - Date.now()) / 1000))
    throw new BiliError('B站请求冷却中，请 ' + seconds + ' 秒后再试')
  }
  const wait = 350 - (Date.now() - lastBiliAt)
  if (wait > 0) await sleep(wait)
  lastBiliAt = Date.now()
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT)
  const abort = () => controller.abort()
  signal?.addEventListener?.('abort', abort, { once: true })
  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'error',
      signal: controller.signal,
      headers: {
        'user-agent': UA,
        referer: 'https://www.bilibili.com/',
        cookie: cookieHeader(credentials),
      },
    })
    if (!response.ok) {
      if (response.status === 412 || response.status === 429) blockedUntil = Date.now() + 5 * 60 * 1000
      throw new BiliError('B站 HTTP ' + response.status)
    }
    const body = await response.json()
    if (body?.code !== 0) {
      if (body?.code === -509 || body?.code === -412) blockedUntil = Date.now() + 2 * 60 * 1000
      throw new BiliError('B站 code=' + String(body?.code ?? '?') + ' ' + String(body?.message ?? ''))
    }
    return body.data ?? {}
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener?.('abort', abort)
  }
}

function safeUrl(value, hosts) {
  try {
    const url = new URL(String(value ?? ''))
    if (url.protocol !== 'https:') return ''
    if (!hosts.some((host) => url.hostname === host || url.hostname.endsWith('.' + host))) return ''
    return url.toString()
  } catch {
    return ''
  }
}

function normalizeVideoUrl(uri, oid) {
  const text = String(uri ?? '').trim()
  if (text.startsWith('https://') || text.startsWith('http://')) {
    return safeUrl(text, ['bilibili.com', 'b23.tv'])
  }
  if (text.startsWith('bilibili://video/')) {
    const id = text.slice('bilibili://video/'.length).split(/[/?#]/)[0]
    return /^\d+$/.test(id) ? 'https://www.bilibili.com/video/av' + id : ''
  }
  const subject = String(oid ?? '').trim()
  if (/^\d+$/.test(subject)) return 'https://www.bilibili.com/video/av' + subject
  return ''
}

function mapInteraction(raw, kind = 'reply') {
  const item = raw?.item ?? {}
  const text = String(item.source_content || item.title || '').replace(/\s+/g, ' ').trim()
  return {
    id: String(raw?.id ?? ''),
    who: String(raw?.user?.nickname ?? 'B站用户').slice(0, 80),
    mid: String(raw?.user?.mid ?? ''),
    avatar: safeUrl(String(raw?.user?.avatar ?? '').replace(/^http:/, 'https:'), ['hdslb.com', 'bilibili.com']),
    text: text.slice(0, 500),
    at: Number(kind === 'at' ? raw?.at_time : raw?.reply_time ?? 0),
    videoTitle: String(item.title ?? '视频').slice(0, 120),
    videoUrl: normalizeVideoUrl(item.uri, item.subject_id),
    cover: safeUrl(String(item.image ?? '').replace(/^http:/, 'https:'), ['hdslb.com', 'bilibili.com']),
    kind,
  }
}

function mapReply(raw) {
  return mapInteraction(raw, 'reply')
}

export function createBiliReader({ directory, warn = () => {} }) {
  const credentialsPath = join(directory, 'credentials.json')
  let cache = null
  let cacheAt = 0

  function readCredentials() {
    try {
      const raw = JSON.parse(readFileSync(credentialsPath, 'utf8').replace(/^\uFEFF/, ''))
      const clean = (value) => String(value ?? '').replace(/^["'\s]+|["'\s]+$/g, '')
      const credentials = {
        sessdata: clean(raw.sessdata),
        bili_jct: clean(raw.bili_jct),
        buvid3: clean(raw.buvid3),
      }
      if (!credentials.sessdata) return null
      return credentials
    } catch {
      return null
    }
  }

  async function snapshot({ force = false } = {}) {
    if (!force && cache !== null && Date.now() - cacheAt < 20000) return cache
    const credentials = readCredentials()
    const previous = cache
    if (credentials === null) {
      cache = {
        authenticated: false,
        account: { name: '未登录', short: '未', authenticated: false },
        replies: [],
        error: '未登录：先用扫码登录',
        fetchedAt: new Date().toISOString(),
      }
      cacheAt = Date.now()
      return cache
    }
    try {
      const nav = await biliGet('https://api.bilibili.com/x/web-interface/nav', credentials)
      if (nav?.isLogin !== true) {
        cache = {
          authenticated: false,
          account: { name: '未登录', short: '未', authenticated: false },
          replies: [],
          error: '登录态已失效，请重新扫码',
          fetchedAt: new Date().toISOString(),
        }
        cacheAt = Date.now()
        return cache
      }
      const [replyFeed, atFeed] = await Promise.all([
        biliGet('https://api.bilibili.com/x/msgfeed/reply?platform=web&build=0&mobi_app=web', credentials).catch(() => ({ items: [] })),
        biliGet('https://api.bilibili.com/x/msgfeed/at?platform=web&build=0&mobi_app=web', credentials).catch(() => ({ items: [] })),
      ])
      const dedupe = new Map()
      for (const item of [
        ...(atFeed?.items ?? []).map((raw) => mapInteraction(raw, 'at')),
        ...(replyFeed?.items ?? []).map((raw) => mapInteraction(raw, 'reply')),
      ]) {
        if (item.id !== '' && !dedupe.has(item.id)) dedupe.set(item.id, item)
      }
      const replies = [...dedupe.values()].sort((a, b) => b.at - a.at)
      let videos = []
      let dm = []
      try {
        const sessions = await biliGet(
          'https://api.vc.bilibili.com/session_svr/v1/session_svr/get_sessions?session_type=1&group_id=0&build=0&mobi_app=web',
          credentials,
        )
        dm = (sessions?.session_list ?? []).slice(0, 20).map((session) => {
          let text = ''
          try { const parsed = JSON.parse(String(session?.last_msg?.content ?? '')); text = String(parsed?.text ?? parsed?.content ?? '') } catch { text = String(session?.last_msg?.content ?? '') }
          const sender = String(session?.last_msg?.sender_uid ?? '')
          return {
            talkerId: String(session?.talker_id ?? ''),
            name: String(session?.account_info?.name ?? session?.uname ?? 'B站用户').slice(0, 80),
            text: text.slice(0, 300),
            at: Number(session?.last_msg?.timestamp ?? 0),
            unread: Number(session?.unread_count ?? 0),
            sender,
            outgoing: sender !== '' && sender === String(nav.mid ?? ''),
          }
        }).filter((row) => row.talkerId !== '')
      } catch (error) {
        warn('dm list unavailable: ' + (error?.message || error))
      }
      try {
        if (nav?.wbi_img && typeof nav.mid !== 'undefined') {
          const query = signWbi({ mid: String(nav.mid), ps: 8, pn: 1, order: 'pubdate' }, nav.wbi_img)
          const space = await biliGet('https://api.bilibili.com/x/space/wbi/arc/search?' + query, credentials)
          videos = (space?.list?.vlist ?? []).map((video) => ({
            bvid: String(video.bvid ?? ''),
            title: String(video.title ?? '').slice(0, 160),
            created: Number(video.created ?? 0),
            comments: Number(video.comment ?? 0),
            url: 'https://www.bilibili.com/video/' + String(video.bvid ?? ''),
          })).filter((video) => video.bvid !== '')
        }
      } catch (error) {
        warn('own-video list unavailable: ' + (error?.message || error))
      }
      const name = String(nav.uname ?? 'B站用户').slice(0, 80)
      let following = null
      let follower = null
      try {
        const stat = await biliGet('https://api.bilibili.com/x/relation/stat?vmid=' + encodeURIComponent(String(nav.mid ?? '')), credentials)
        following = Number(stat?.following)
        follower = Number(stat?.follower)
      } catch (error) {
        warn('account stats unavailable: ' + (error?.message || error))
      }
      cache = {
        authenticated: true,
        account: {
          mid: String(nav.mid ?? ''),
          name,
          short: name.slice(0, 1) || 'B',
          face: safeUrl(String(nav.face ?? '').replace(/^http:/, 'https:'), ['hdslb.com', 'bilibili.com']),
          sign: String(nav.sign ?? '').slice(0, 200),
          level: Number(nav.level_info?.current_level ?? 0),
          following,
          follower,
          authenticated: true,
        },
        replies,
        videos,
        dm,
        fetchedAt: new Date().toISOString(),
      }
      cacheAt = Date.now()
      return cache
    } catch (error) {
      warn('read-only bili snapshot failed: ' + (error?.message || error))
      cache = previous && previous.authenticated
        ? { ...previous, error: error?.message || 'B站请求失败', stale: true, fetchedAt: new Date().toISOString() }
        : {
            authenticated: false,
            account: { name: '未登录', short: '未', authenticated: false },
            replies: [],
            error: error?.message || 'B站请求失败',
            fetchedAt: new Date().toISOString(),
          }
      cacheAt = Date.now()
      return cache
    }
  }

  async function dmSessions() {
    const credentials = readCredentials()
    if (credentials === null) throw new BiliError('未登录：先用扫码登录')
    const data = await biliGet(
      'https://api.vc.bilibili.com/session_svr/v1/session_svr/get_sessions?session_type=1&group_id=0&build=0&mobi_app=web',
      credentials,
    )
    return (data?.session_list ?? []).map((session) => ({
      talkerId: String(session?.talker_id ?? ''),
      name: String(session?.account_info?.name ?? session?.uname ?? 'B站用户').slice(0, 80),
      unread: Number(session?.unread_count ?? 0),
    })).filter((session) => session.talkerId !== '')
  }

  async function dmMessages(talkerId) {
    const credentials = readCredentials()
    if (credentials === null) throw new BiliError('未登录：先用扫码登录')
    const data = await biliGet(
      'https://api.vc.bilibili.com/svr_sync/v1/svr_sync/fetch_session_msgs?talker_id=' + encodeURIComponent(String(talkerId)) + '&session_type=1&size=30&begin_seqno=0',
      credentials,
    )
    return (data?.messages ?? []).map((message, index) => {
      let text = String(message?.content ?? '')
      try { const parsed = JSON.parse(text); text = String(parsed?.content ?? parsed?.text ?? text) } catch {}
      return {
        id: String(message?.msg_key ?? message?.msg_seqno ?? (message?.timestamp + ':' + index)),
        sender: String(message?.sender_uid ?? ''),
        text,
        at: Number(message?.timestamp ?? 0),
        type: Number(message?.msg_type ?? 1),
      }
    }).filter((message) => message.sender !== '' && message.type === 1)
  }

  async function dmContext(talkerId) {
    const id = String(talkerId ?? '')
    if (!/^[1-9]\d{0,19}$/.test(id)) throw new BiliError('私信对象 UID 不正确')
    const messages = await dmMessages(id)
    return {
      talkerId: id,
      messages,
      lastIncoming: messages.find((message) => message.sender === id) || null,
      lastOutgoing: messages.find((message) => message.sender !== id) || null,
      fetchedAt: new Date().toISOString(),
    }
  }

  async function commentContext({ bvid, rpid } = {}) {
    const id = String(bvid ?? '').trim()
    const rootId = String(rpid ?? '').trim()
    if (!/^BV[0-9A-Za-z]{10}$/.test(id)) throw new BiliError('BV 号格式不正确')
    if (!/^[1-9]\d{0,19}$/.test(rootId)) throw new BiliError('评论 rpid 不正确')
    const credentials = readCredentials()
    if (credentials === null) throw new BiliError('未登录：先用扫码登录')
    const view = await biliGet('https://api.bilibili.com/x/web-interface/view?bvid=' + encodeURIComponent(id), credentials)
    const aid = Number(view?.aid ?? 0)
    if (!aid) throw new BiliError('视频不存在或不可见')
    const feed = await biliGet(
      'https://api.bilibili.com/x/v2/reply/reply?type=1&oid=' + aid + '&root=' + rootId + '&ps=20&pn=1',
      credentials,
    )
    const map = (reply) => reply ? {
      id: String(reply.rpid ?? ''),
      who: String(reply.member?.uname ?? 'B站用户').slice(0, 60),
      text: String(reply.content?.message ?? '').slice(0, 1000),
      at: Number(reply.ctime ?? 0),
      likes: Number(reply.like ?? 0),
      parent: String(reply.parent_str ?? ''),
    } : null
    return {
      bvid: id,
      title: String(view?.title ?? '').slice(0, 160),
      parent: map(feed?.root || feed?.data?.root),
      replies: (feed?.replies || feed?.data?.replies || []).map(map).filter((row) => row && row.id),
      fetchedAt: new Date().toISOString(),
    }
  }

  async function mutual() {
    const credentials = readCredentials()
    if (credentials === null) throw new BiliError('未登录：先用扫码登录')
    const nav = await biliGet('https://api.bilibili.com/x/web-interface/nav', credentials)
    const mid = String(nav?.mid ?? '')
    if (!mid) throw new BiliError('登录态无效，请重新扫码')
    const all = []
    let total = 0
    for (let pn = 1; pn <= 6; pn += 1) {
      const feed = await biliGet(
        'https://api.bilibili.com/x/relation/followings?vmid=' + encodeURIComponent(mid) + '&pn=' + pn + '&ps=50&order=desc',
        credentials,
      )
      const rows = feed?.list ?? []
      total = Number(feed?.total ?? rows.length)
      all.push(...rows)
      if (rows.length < 50 || all.length >= total) break
    }
    const members = all.map((row) => ({
      mid: String(row?.mid ?? ''),
      name: String(row?.uname ?? '').slice(0, 80),
      // followings 接口里 attribute=6 才是互关；attribute=2 不是互关。
      mutual: Number(row?.attribute) === 6,
    })).filter((row) => row.mid !== '')
    return {
      self: { mid, name: String(nav?.uname ?? '') },
      members: members.filter((row) => row.mutual),
      totalFollowings: total,
      scanned: members.length,
      fetchedAt: new Date().toISOString(),
    }
  }

  async function comments({ bvid } = {}) {    const id = String(bvid ?? '').trim()
    if (!/^BV[0-9A-Za-z]{10}$/.test(id)) throw new BiliError('BV 号格式不正确')
    const credentials = readCredentials()
    if (credentials === null) throw new BiliError('未登录：先用扫码登录')
    const view = await biliGet('https://api.bilibili.com/x/web-interface/view?bvid=' + encodeURIComponent(id), credentials)
    const aid = Number(view?.aid ?? 0)
    if (!aid) throw new BiliError('视频不存在或不可见')
    const feed = await biliGet(
      'https://api.bilibili.com/x/v2/reply?type=1&oid=' + aid + '&sort=2&ps=20&pn=1',
      credentials,
    )
    const rows = (feed?.replies ?? []).map((reply) => ({
      id: String(reply?.rpid ?? ''),
      mid: String(reply?.member?.mid ?? ''),
      who: String(reply?.member?.uname ?? 'B站用户').slice(0, 60),
      text: String(reply?.content?.message ?? '').slice(0, 500),
      at: Number(reply?.ctime ?? 0),
      likes: Number(reply?.like ?? 0),
    })).filter((row) => row.id !== '')
    return {
      bvid: id,
      title: String(view?.title ?? '').slice(0, 160),
      comments: rows,
      fetchedAt: new Date().toISOString(),
    }
  }

  return { snapshot, comments, commentContext, mutual, dmSessions, dmMessages, dmContext }
}
