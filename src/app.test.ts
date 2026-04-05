import { describe, expect, it } from 'vitest'
import app from './app.js'

describe('GET /', () => {
  it('returns Hello Hono! as text', async () => {
    const res = await app.request('/')
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('Hello Hono!')
  })
})

describe('GET /api/hello', () => {
  it('returns JSON with ok and message', async () => {
    const res = await app.request('/api/hello')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      ok: true,
      message: 'Hello World Hono!',
    })
  })
})
