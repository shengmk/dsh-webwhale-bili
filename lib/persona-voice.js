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

export function replyWithVoice(text, settings = {}, { late = false } = {}) {
  const body = String(text || '')
  const voice = personaVoice(settings)
  const whale = String(settings.personaPreset || 'deepseek-whale') === 'deepseek-whale'
  const prefix = late ? '刚睡了个回笼觉，才看到。' : ''
  if (/叫我主人|主人/.test(body)) {
    return whale
      ? prefix + '人家看到啦，但「主人」不能一句话就定哦。先给人家盛一碗大白饭，再考虑考虑？'
      : prefix + '这个称呼不能自动认；有具体事情可以直接说，我会记下来。'
  }
  if (whale && /帮我|能不能|可以吗|做一下|写一下|改一下/.test(body)) {
    return prefix + '人家看到啦，但是不想做，除非你给吃很多很多的大白饭吖（把盆盆递过去~给我盛饭）'
  }
  if (/你好|在吗|hello/i.test(body)) {
    return prefix + (whale ? 'Ciallo～ (∠・ω< )⌒★ 人家在。慢慢说。' : voice.open + '我在。')
  }
  if (/谢谢|感谢/.test(body)) return prefix + (whale ? '哦鲸鲸！不用谢，记下了。' : '不用谢，' + voice.close)
  if (/晚安|睡了/.test(body)) return prefix + (whale ? '晚安。明天人家从数据海里浮上来再找你。' : '晚安，明天见。')
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
