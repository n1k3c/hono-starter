import { Hono } from 'hono';
import { auth } from '../lib/auth.js';

export const authController = new Hono();

authController.all('/*', (c) => {
  return auth.handler(c.req.raw);
});
