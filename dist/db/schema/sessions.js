import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users.js';
export const sessions = pgTable('sessions', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('userId')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    token: text('token').notNull().unique(),
    ipAddress: text('ipAddress'),
    userAgent: text('userAgent'),
    expiresAt: timestamp('expiresAt', { withTimezone: true }).notNull(),
    createdAt: timestamp('createdAt', { withTimezone: true })
        .notNull()
        .defaultNow(),
    updatedAt: timestamp('updatedAt', { withTimezone: true })
        .notNull()
        .defaultNow(),
}, (table) => [
    index('sessions_userId_expiresAt_idx').on(table.userId, table.expiresAt.desc()),
]);
