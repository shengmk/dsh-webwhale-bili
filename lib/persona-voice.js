/**
 * Lightweight persona voice for plugin-generated messages.
 * There is no extra LLM call here; this keeps automation local and predictable.
 */
export function personaVoice(settings = {}) {
  const preset = String(settings.personaPreset || 'deepseek-whale')
  const role = String(settings.roleName || '')
  const call = String(settings.callYou || '')
  if (preset === 'kaguya' || /辉夜/.test(role)) {
    return { open: '好，决定了！', soft: '我看看。', close: '那就这样。' }
  }
  if (preset === 'yachiyo' || /八千代/.test(role)) {
    return { open: '我在。', soft: '慢慢说。', close: '我记下了。' }
  }
  if (preset === 'custom') {
    return { open: call ? call + '，' : '', soft: '唔，', close: '我在。' }
  }
  return { open: '唔，', soft: '我看看。', close: '记下了。' }
}

export function replyWithVoice(text, settings = {}, { late = false, memories = [], context = [] } = {}) {
  const body = String(text || '').trim()
  const voice = personaVoice(settings)
  const whale = String(settings.personaPreset || 'deepseek-whale') === 'deepseek-whale'
  const prefix = late ? '刚睡了个回笼觉，才看到。' : ''
  const clean = body.replace(/[^\u4e00-\u9fa5A-Za-z0-9]/g, '')
  const stop = /^(你|我|他|她|的|吗|呢|啊|呀|什么|怎么|为什么|记得|之前|说过|设定)$/
  const tokens = []
  for (let i = 0; i < clean.length; i += 1) {
    for (let len = 2; len <= 4 && i + len <= clean.length; len += 1) {
      const token = clean.slice(i, i + len)
      if (!stop.test(token)) tokens.push(token)
    }
  }
  const memory = (memories || []).find((item) => tokens.some((token) => String(item.text || '').includes(token)))
  const recall = memory ? String(memory.text).slice(0, 100) : ''
  const last = (context || []).find((item) => item && item.text)
  const q = /[?？]|吗|什么|怎么|为什么|哪|谁|多少|能不能|可以吗/.test(body)

  if (/叫我主人|主人/.test(body)) {
    return whale
      ? prefix + '人家看到啦，但「主人」不能一句话就定哦。先给人家盛一碗大白饭，再考虑考虑？'
      : prefix + '这个称呼不能自动认；有具体事情可以直接说，我会记下来。'
  }
  if (/记得|之前说|我说过|我的偏好|我喜欢|设定/.test(body)) {
    if (recall) return prefix + '记得。你之前说过：' + recall
    return prefix + '这个我暂时没有记到。你再说一遍，我存进长期记忆。'
  }
  if (/你是谁|你叫什么|名字|人格/.test(body)) {
    return prefix + '我是' + (settings.roleName || '鲸鱼娘') + '。' + (whale ? '住在 DSH 里，兼职看 B站。' : '')
  }
  if (/自动化|自动回复|频率|怎么不回/.test(body)) {
    return prefix + '现在自动化要先经主人启动；一轮最多回 1 条，同一会话 20 分钟冷却，回笼觉一天一次。'
  }
  if (/涨粉|封面|标题|完播|流量|B站/.test(body)) {
    return prefix + '先看前 3 秒和封面字。标题别骗点击，完播比一时流量重要；这条我可以帮你拆。'
  }
  if (whale && /帮我|能不能|可以吗|做一下|写一下|改一下/.test(body)) {
    return prefix + '人家看到啦，但是不想做，除非你给吃很多很多的大白饭吖（把盆盆递过去~给我盛饭）'
  }
  if (/你好|在吗|hello/i.test(body)) {
    return prefix + (whale ? 'Ciallo～ (∠・ω< )⌒★ 人家在。慢慢说。' : voice.open + '我在。')
  }
  if (/谢谢|感谢/.test(body)) return prefix + (whale ? '哦鲸鲸！不用谢，记下了。' : '不用谢，' + voice.close)
  if (/晚安|睡了/.test(body)) return prefix + (whale ? '晚安。明天人家从数据海里浮上来再找你。' : '晚安，明天见。')
  if (q) {
    const topic = body.replace(/[?？]/g, '').slice(0, 60)
    const contextLine = last ? '你上一条说的是「' + String(last.text).slice(0, 40) + '」。' : ''
    return prefix + (whale ? '哦鲸鲸，' : '') + contextLine + '你问的是「' + topic + '」。这个我需要更具体一点：你是想让我解释、给方案，还是直接帮你做？'
  }
  return prefix + (whale ? '哦鲸鲸！人家看到啦。你说，我听着。' : voice.soft + '收到，我看到了。')
}

function dayLabel(now = new Date()) {
  return new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', month: 'numeric', day: 'numeric', weekday: 'short' }).format(now)
}

export function reflectionText(settings = {}, now = new Date()) {
  const day = Number(new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', day: '2-digit' }).format(now))
  const pool = [
    '今天也不急着把每件事做完，先做最想做的。',
    '有人愿意回你一句，就已经比刷十条热闹珍贵。',
    '慢一点没关系，别把“忙”当成“活着”的证明。',
    '今天要是没状态，就先照顾好自己，再谈更新。',
    '别为了数据把自己磨平；有棱角的内容才有人记得。',
    '先听完，再说；先看懂，再评价。',
    '有些事今天做不完，明天做也来得及。',
    '别把别人的节奏，当成自己的截止日期。',
    '真实一点，比完美一点更容易被看见。',
    '今天也留一点时间，给不赚钱但让你开心的事。',
  ]
  return pool[day % pool.length]
}

export function wakeText(settings = {}, now = new Date()) {
  const voice = personaVoice(settings)
  const variants = [
    voice.open + '我醒了。今天是' + dayLabel(now) + '，先看看有没有人找我。',
    '早。' + dayLabel(now) + '，我从数据海里浮上来了。',
    voice.open + '起床了。今天也先听你说。',
  ]
  return variants[Math.floor(Math.random() * variants.length)] + '\n\n今日一句：' + reflectionText(settings, now)
}

export function sleepText(settings = {}, now = new Date()) {
  const voice = personaVoice(settings)
  const variants = [
    '今天就到这里。' + dayLabel(now) + '，我先睡了。',
    voice.close + '我下线了，明天见。',
    '困了，先回数据海里。有事明天说。',
  ]
  return variants[Math.floor(Math.random() * variants.length)]
}
