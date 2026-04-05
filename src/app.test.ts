import { describe, expect, it } from 'vitest'
import app from './app.js'

describe('GET /api/v1/ping', () => {
  it('returns pong', async () => {
    const res = await app.request('/api/v1/ping')
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('pong')
  })
})

describe('GET /api/v1/docs', () => {
  it('returns 200', async () => {
    const res = await app.request('/api/v1/docs')
    expect(res.status).toBe(200)
  })
})

describe('GET /api/v1/openapi.json', () => {
  it('returns OpenAPI spec', async () => {
    const res = await app.request('/api/v1/openapi.json')
    expect(res.status).toBe(200)
    const spec = await res.json()
    expect(spec.info.title).toBe('Hono Starter API')
    expect(spec.paths).toBeDefined()
  })
})

describe('POST /api/v1/todos', () => {
  it('returns 401 without auth', async () => {
    const res = await app.request('/api/v1/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: '550e8400-e29b-41d4-a716-446655440000', title: 'Test' }),
    })
    expect(res.status).toBe(401)
  })
})

describe('PATCH /api/v1/todos/:id', () => {
  it('returns 401 without auth', async () => {
    const res = await app.request('/api/v1/todos/550e8400-e29b-41d4-a716-446655440000', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Updated' }),
    })
    expect(res.status).toBe(401)
  })
})

describe('DELETE /api/v1/todos/:id', () => {
  it('returns 401 without auth', async () => {
    const res = await app.request('/api/v1/todos/550e8400-e29b-41d4-a716-446655440000', {
      method: 'DELETE',
    })
    expect(res.status).toBe(401)
  })
})
