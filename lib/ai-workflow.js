import { replyWithVoice } from './persona-voice.js'

/**
 * AI/规则候选线：只生成候选文本，不发送、不改审批状态。
 */
export function proposeCandidate({ store, text, settings, late = false, context = [] } = {}) {
  const memories = typeof store.listMemory === 'function' ? store.listMemory().slice(0, 40) : []
  return replyWithVoice(text, settings || {}, { late, memories, context })
}
