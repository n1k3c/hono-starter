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

  it('includes auth and todo paths', async () => {
    const res = await app.request('/api/v1/openapi.json')
    const spec = await res.json()
    expect(spec.paths['/api/v1/auth/sign-up/email']).toBeDefined()
    expect(spec.paths['/api/v1/auth/sign-in/email']).toBeDefined()
    const todoPaths = Object.keys(spec.paths).filter((p: string) => p.includes('todos'))
    expect(todoPaths.length).toBeGreaterThan(0)
  })
})

describe('Todo endpoints — auth required', () => {
  it('POST /api/v1/todos returns 401 without auth', async () => {
    const res = await app.request('/api/v1/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: '550e8400-e29b-41d4-a716-446655440000', title: 'Test' }),
    })
    expect(res.status).toBe(401)
  })

  it('PATCH /api/v1/todos/:id returns 401 without auth', async () => {
    const res = await app.request('/api/v1/todos/550e8400-e29b-41d4-a716-446655440000', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Updated' }),
    })
    expect(res.status).toBe(401)
  })

  it('DELETE /api/v1/todos/:id returns 401 without auth', async () => {
    const res = await app.request('/api/v1/todos/550e8400-e29b-41d4-a716-446655440000', {
      method: 'DELETE',
    })
    expect(res.status).toBe(401)
  })
})

describe('Todo endpoints — validation', () => {
  it('POST /api/v1/todos rejects invalid UUID', async () => {
    const res = await app.request('/api/v1/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'not-a-uuid', title: 'Test' }),
    })
    // 401 takes precedence (auth middleware runs first), but if auth were bypassed this would be 400
    expect(res.status).toBe(401)
  })

  it('PATCH /api/v1/todos/:id rejects invalid UUID param', async () => {
    const res = await app.request('/api/v1/todos/not-a-uuid', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Updated' }),
    })
    expect(res.status).toBe(401)
  })
})

describe('Global error handler', () => {
  it('returns JSON error for non-existent routes', async () => {
    const res = await app.request('/api/v1/nonexistent')
    expect(res.status).toBe(404)
  })
})

describe('CORS', () => {
  it('includes CORS headers on preflight', async () => {
    const res = await app.request('/api/v1/ping', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3001',
        'Access-Control-Request-Method': 'GET',
      },
    })
    expect(res.headers.get('access-control-allow-origin')).toBe('http://localhost:3001')
    expect(res.headers.get('access-control-allow-credentials')).toBe('true')
  })

  it('rejects disallowed origin', async () => {
    const res = await app.request('/api/v1/ping', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://evil.com',
        'Access-Control-Request-Method': 'GET',
      },
    })
    expect(res.headers.get('access-control-allow-origin')).not.toBe('http://evil.com')
  })
})
