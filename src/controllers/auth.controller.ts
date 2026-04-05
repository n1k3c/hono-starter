import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { auth } from '../lib/auth.js';

export const authController = new OpenAPIHono();

const SignUpSchema = z.object({
  name: z.string().min(1).openapi({ example: 'John Doe' }),
  email: z.string().email().openapi({ example: 'mail@mail.com' }),
  password: z.string().min(8).openapi({ example: 'pass12345' }),
});

const SignInSchema = z.object({
  email: z.string().email().openapi({ example: 'mail@mail.com' }),
  password: z.string().min(1).openapi({ example: 'pass12345' }),
});

const UserSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string().email(),
    emailVerified: z.boolean(),
    image: z.string().nullable(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
  })
  .openapi('User');

const SessionSchema = z
  .object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    token: z.string(),
    expiresAt: z.coerce.date(),
  })
  .openapi('Session');

const AuthResponseSchema = z.object({
  user: UserSchema,
  session: SessionSchema,
});

// Register OpenAPI docs only (no validation — Better Auth handles these routes)
const signUpRoute = createRoute({
  method: 'post',
  path: '/sign-up/email',
  tags: ['Auth'],
  summary: 'Register a new account',
  request: {
    body: { content: { 'application/json': { schema: SignUpSchema } } },
  },
  responses: {
    200: {
      description: 'Account created',
      content: { 'application/json': { schema: AuthResponseSchema } },
    },
    400: { description: 'Invalid input or email already taken' },
  },
});

const signInRoute = createRoute({
  method: 'post',
  path: '/sign-in/email',
  tags: ['Auth'],
  summary: 'Sign in with email and password',
  request: {
    body: { content: { 'application/json': { schema: SignInSchema } } },
  },
  responses: {
    200: {
      description: 'Signed in',
      content: { 'application/json': { schema: AuthResponseSchema } },
    },
    401: { description: 'Invalid credentials' },
  },
});

const getSessionRoute = createRoute({
  method: 'get',
  path: '/get-session',
  tags: ['Auth'],
  summary: 'Get current session',
  responses: {
    200: {
      description: 'Current session',
      content: { 'application/json': { schema: AuthResponseSchema } },
    },
    401: { description: 'Not authenticated' },
  },
});

const signOutRoute = createRoute({
  method: 'post',
  path: '/sign-out',
  tags: ['Auth'],
  summary: 'Sign out',
  request: {
    body: { content: { 'application/json': { schema: z.object({}) } } },
  },
  responses: {
    200: { description: 'Signed out' },
  },
});

// Register routes in OpenAPI registry for docs
authController.openAPIRegistry.registerPath(signUpRoute);
authController.openAPIRegistry.registerPath(signInRoute);
authController.openAPIRegistry.registerPath(getSessionRoute);
authController.openAPIRegistry.registerPath(signOutRoute);

// All auth requests handled by Better Auth
authController.on(['POST', 'GET'], '/*', (c) => {
  return auth.handler(c.req.raw);
});
