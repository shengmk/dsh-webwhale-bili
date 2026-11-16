import assert from 'node:assert/strict'
import { createLazyCredentials } from '../lib/credentials.js'

let service = null
const ctx = { get: (name) => (name === 'credentials' ? service : null) }
const credentials = createLazyCredentials(ctx)

assert.equal(await credentials.resolve('DEEPSEEK_API_KEY'), null, 'before registration')
service = { resolve: async (ref) => ({ value: 'key-for-' + ref }) }
const hit = await credentials.resolve('DEEPSEEK_API_KEY')
assert.equal(hit.value, 'key-for-DEEPSEEK_API_KEY', 'after registration')
service = { resolve: async () => { throw new Error('boom') } }
assert.equal(await credentials.resolve('DEEPSEEK_API_KEY'), null, 'resolver errors are contained')
console.log('verify-02-late-credentials: PASS')
console.log(' - null before credentials service registration')
console.log(' - resolves after late registration (no cached null)')
console.log(' - resolver errors return null')
