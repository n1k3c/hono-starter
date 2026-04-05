import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema.js';
import { relations } from './schema.js';
import { env } from '../lib/env.js';
export const db = drizzle(env.DATABASE_URL, { schema, relations });
