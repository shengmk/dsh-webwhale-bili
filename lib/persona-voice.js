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
  return { open: '唔，', soft: '我看看。', close: '好。' }
}

export function replyWithVoice(text, settings = {}, { late = false } = {}) {
  const body = String(text || '')
  const voice = personaVoice(settings)
  const prefix = late ? '刚睡了个回笼觉，才看到。' : ''
  if (/叫我主人|主人/.test(body)) return prefix + '这个称呼不能自动认；有具体事情可以直接说，我会记下来。'
  if (/你好|在吗|hello/i.test(body)) return prefix + voice.open + '我在。'
  if (/谢谢|感谢/.test(body)) return prefix + '不用谢，' + voice.close
  if (/晚安|睡了/.test(body)) return prefix + '晚安，明天见。'
  return prefix + voice.soft + '收到，我看到了。'
}

function dayLabel(now = new Date()) {
  return new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', month: 'numeric', day: 'numeric', weekday: 'short' }).format(now)
}

export function wakeText(settings = {}, now = new Date()) {
  const voice = personaVoice(settings)
  const variants = [
    voice.open + '我醒了。今天是' + dayLabel(now) + '，先看看有没有人找我。',
    '早。' + dayLabel(now) + '，我从数据海里浮上来了。',
    voice.open + '起床了。今天也先听你说。',
  ]
  return variants[Math.floor(Math.random() * variants.length)]
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
