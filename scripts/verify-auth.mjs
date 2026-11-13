import { QrAuth } from '../lib/auth.js'

const failures = []
function ok(condition, message) {
  if (!condition) failures.push(message)
}

const originalFetch = globalThis.fetch
let now = 0
try {
  globalThis.fetch = async (url) => {
    if (String(url).includes('/qrcode/generate')) {
      return new Response(JSON.stringify({
        code: 0,
        data: {
          url: 'https://passport.bilibili.com/h5-app/passport/login/scan?x=1',
          qrcode_key: 'abcDEF_123',
        },
      }), { headers: { 'content-type': 'application/json' } })
    }
    return new Response(JSON.stringify({ code: 0, data: { code: 0 } }), {
      headers: {
        'content-type': 'application/json',
        'set-cookie': [
          'SESSDATA=abc123; Path=/; HttpOnly',
          'bili_jct=0123456789abcdef0123456789abcdef; Path=/',
          'buvid3=buv; Path=/',
        ],
      },
    })
  }

  const auth = new QrAuth({
    now: () => now,
    render: async () => 'data:image/png;base64,xx',
    save: async (credentials) => {
      ok(credentials.sessdata === 'abc123', 'SESSDATA must be mapped to lowercase key')
      ok(credentials.bili_jct === '0123456789abcdef0123456789abcdef', 'bili_jct must be mapped')
      return { mid: '1', name: 'tester', authenticated: true }
    },
  })
  const started = await auth.start()
  ok(started.status === 'waiting', 'QR start must be waiting')
  ok(typeof started.image === 'string' && started.image.startsWith('data:image/png'), 'QR image must be a PNG data URL')
  now = 3000
  const polled = await auth.poll(started.id)
  ok(polled.status === 'success', 'QR poll must reach success')
  ok(polled.account?.name === 'tester', 'success must include the public account')

  if (failures.length > 0) {
    console.error('verify-auth: FAIL')
    for (const failure of failures) console.error(' - ' + failure)
    process.exit(1)
  }
  console.log('verify-auth: PASS')
  console.log(' - QR generate -> poll success; cookies mapped (SESSDATA/bili_jct/buvid3)')
} catch (error) {
  console.error('verify-auth: FAIL')
  console.error(' - ' + (error?.stack || error))
  process.exit(1)
} finally {
  globalThis.fetch = originalFetch
}
