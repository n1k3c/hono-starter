import { z } from '@hono/zod-openapi'

export const SignUpSchema = z.object({
  name: z.string().min(1).openapi({ example: 'John Doe' }),
  email: z.string().email().openapi({ example: 'mail@mail.com' }),
  password: z.string().min(8).openapi({ example: 'pass12345' }),
})

export const SignInSchema = z.object({
  email: z.string().email().openapi({ example: 'mail@mail.com' }),
  password: z.string().min(1).openapi({ example: 'pass12345' }),
})

export const UserSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string().email(),
    emailVerified: z.boolean(),
    image: z.string().nullable(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
  })
  .openapi('User')

export const SessionSchema = z
  .object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    token: z.string(),
    expiresAt: z.coerce.date(),
  })
  .openapi('Session')

export const AuthResponseSchema = z.object({
  user: UserSchema,
  session: SessionSchema,
})
