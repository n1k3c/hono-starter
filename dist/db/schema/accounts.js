import { pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core';
import { users } from './users.js';
export const accounts = pgTable('accounts', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('userId')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    providerId: text('providerId').notNull(),
    accountId: text('accountId').notNull(),
    accessToken: text('accessToken'),
    refreshToken: text('refreshToken'),
    idToken: text('idToken'),
    scope: text('scope'),
    password: text('password'),
    accessTokenExpiresAt: timestamp('accessTokenExpiresAt', {
        withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt', {
        withTimezone: true,
    }),
    createdAt: timestamp('createdAt', { withTimezone: true })
        .notNull()
        .defaultNow(),
    updatedAt: timestamp('updatedAt', { withTimezone: true })
        .notNull()
        .defaultNow(),
}, (table) => [
    unique('accounts_userId_providerId_key').on(table.userId, table.providerId),
]);
