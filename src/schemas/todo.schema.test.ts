import { describe, expect, it } from 'vitest'
import { CreateTodoSchema, UpdateTodoSchema } from './todo.schema.js'

describe('CreateTodoSchema', () => {
  it('accepts valid input with title', () => {
    const result = CreateTodoSchema.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Buy groceries',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.title).toBe('Buy groceries')
    }
  })

  it('defaults title to "New Todo" when omitted', () => {
    const result = CreateTodoSchema.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.title).toBe('New Todo')
    }
  })

  it('rejects invalid UUID', () => {
    const result = CreateTodoSchema.safeParse({
      id: 'not-a-uuid',
      title: 'Test',
    })
    expect(result.success).toBe(false)
  })

  it('rejects title exceeding 256 characters', () => {
    const result = CreateTodoSchema.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'a'.repeat(257),
    })
    expect(result.success).toBe(false)
  })
})

describe('UpdateTodoSchema', () => {
  it('accepts title only', () => {
    const result = UpdateTodoSchema.safeParse({ title: 'Updated' })
    expect(result.success).toBe(true)
  })

  it('accepts completed only', () => {
    const result = UpdateTodoSchema.safeParse({ completed: true })
    expect(result.success).toBe(true)
  })

  it('accepts both fields', () => {
    const result = UpdateTodoSchema.safeParse({ title: 'Updated', completed: true })
    expect(result.success).toBe(true)
  })

  it('parses empty body as valid (service layer rejects it)', () => {
    const result = UpdateTodoSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('rejects invalid types', () => {
    const result = UpdateTodoSchema.safeParse({ title: 123 })
    expect(result.success).toBe(false)
  })
})
