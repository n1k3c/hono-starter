import { describe, expect, it } from 'vitest'
import { SignUpSchema, SignInSchema } from './auth.schema.js'

describe('SignUpSchema', () => {
  it('accepts valid sign-up input', () => {
    const result = SignUpSchema.safeParse({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'pass12345',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty name', () => {
    const result = SignUpSchema.safeParse({
      name: '',
      email: 'john@example.com',
      password: 'pass12345',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid email', () => {
    const result = SignUpSchema.safeParse({
      name: 'John',
      email: 'not-an-email',
      password: 'pass12345',
    })
    expect(result.success).toBe(false)
  })

  it('rejects password shorter than 8 characters', () => {
    const result = SignUpSchema.safeParse({
      name: 'John',
      email: 'john@example.com',
      password: 'short',
    })
    expect(result.success).toBe(false)
  })
})

describe('SignInSchema', () => {
  it('accepts valid sign-in input', () => {
    const result = SignInSchema.safeParse({
      email: 'john@example.com',
      password: 'pass12345',
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing email', () => {
    const result = SignInSchema.safeParse({ password: 'pass12345' })
    expect(result.success).toBe(false)
  })

  it('rejects missing password', () => {
    const result = SignInSchema.safeParse({ email: 'john@example.com' })
    expect(result.success).toBe(false)
  })
})
