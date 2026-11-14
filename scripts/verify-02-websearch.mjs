import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createModelChat } from '../lib/model-chat.js'
import { needsWebSearch, parse360Results, parseBingResults, searchQueryFor, searchWeb } from '../lib/web-search.js'

const html360 = `
<ul class="result">
  <li class="res-list" data-result-type="normal">
    <h3 class="res-title"><a href="https://www.so.com/link?x=1" data-mdurl="https://example.com/a">2026年新高考一卷数学第19题解析</a></h3>
    <p class="res-desc"><span data-result-summary>2026年新高考一卷第19题是<em>新定义集合</em>压轴题，已有解析。</span></p>
  </li>
  <li class="res-list" data-result-type="normal">
    <h3 class="res-title"><a href="https://example.com/b">另一个来源</a></h3>
    <p class="res-desc">补充说明 &amp; 注意事项。</p>
  </li>
</ul>`

const htmlBing = `
<ol id="b_results">
  <li class="b_algo" data-id iid=SERP.1>
    <h2><a href="https://example.com/bing">Bing 备用结果</a></h2>
    <p class="b_lineclamp2">Bing 的摘要。</p>
  </li>
</ol>`

assert.equal(needsWebSearch('26年新一卷高考数学19题解题过程你给我写一下'), true)
assert.equal(needsWebSearch('今年有什么新番'), true)
assert.equal(needsWebSearch('你好'), false)
assert.equal(needsWebSearch('[图片]'), false)
const query = searchQueryFor('26年新一卷高考数学19题解题过程你给我写一下')
assert.match(query, /^2026年/)
assert.match(query, /新高考一卷/)
assert.match(query, /答案 解析$/)

const parsed360 = parse360Results(html360)
assert.equal(parsed360.length, 2)
assert.equal(parsed360[0].title, '2026年新高考一卷数学第19题解析')
assert.equal(parsed360[0].url, 'https://example.com/a')
assert.match(parsed360[0].snippet, /新定义集合/)
assert.equal(parsed360[1].snippet, '补充说明 & 注意事项。')

const parsedBing = parseBingResults(htmlBing)
assert.equal(parsedBing.length, 1)
assert.equal(parsedBing[0].title, 'Bing 备用结果')

const calls = []
const fakeFetch = async (url) => {
  calls.push(String(url))
  if (String(url).startsWith('https://www.so.com/s')) {
    return { ok: true, status: 200, text: async () => html360 }
  }
  if (String(url).startsWith('https://www.bing.com/search')) {
    return { ok: true, status: 200, text: async () => htmlBing }
  }
  return {
    ok: true,
    status: 200,
    json: async () => ({ choices: [{ message: { content: '查到了：2026年新高考一卷数学第19题已经有解析。' } }] }),
  }
}

const dir = mkdtempSync(join(tmpdir(), 'ww-websearch-'))
try {
  const chat = createModelChat({
    store: null,
    credentials: { resolve: async () => ({ value: 'sk-test-not-real' }) },
    directory: dir,
    fetchImpl: fakeFetch,
  })
  const result = await chat.reply({ talkerId: '42', name: '测试', text: '26年新高考一卷数学19题答案', settings: { webSearch: true } })
  assert.ok(result)
  assert.match(result.text, /2026年新高考一卷数学/)
  assert.equal(calls.length, 2)
  assert.ok(calls[0].startsWith('https://www.so.com/s'))
  assert.ok(calls[1].startsWith('https://api.deepseek.com/chat/completions'))

  const second = await chat.reply({ talkerId: '42', name: '测试', text: '你好', settings: { webSearch: true } })
  assert.ok(second)
  assert.equal(calls.length, 3)
  assert.ok(!calls[2].startsWith('https://www.so.com/s'))

  const noSearch = await chat.reply({ talkerId: '43', name: '测试', text: '26年高考数学题', settings: { webSearch: false } })
  assert.ok(noSearch)
  assert.equal(calls.length, 4)
  assert.ok(!calls[3].startsWith('https://www.so.com/s'))

  const first = await searchWeb('26年高考数学题', { fetchImpl: fakeFetch })
  assert.equal(first.ok, true)
  assert.equal(first.engine, '360')
  assert.equal(first.results.length, 2)

  const fallback = await searchWeb('26年高考数学题', {
    fetchImpl: async (url) => {
      if (String(url).startsWith('https://www.so.com/s')) return { ok: true, status: 200, text: async () => '<html></html>' }
      return { ok: true, status: 200, text: async () => htmlBing }
    },
  })
  assert.equal(fallback.ok, true)
  assert.equal(fallback.engine, 'bing')
} finally {
  rmSync(dir, { recursive: true, force: true })
}

console.log('verify-02-websearch: PASS')
