import { boolean, index, pgTable, timestamp, uuid, varchar, } from 'drizzle-orm/pg-core';
import { users } from './users.js';
export const todos = pgTable('todos', {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 256 }).notNull(),
    completed: boolean('completed').notNull().default(false),
    ownerId: uuid('ownerId')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('createdAt', { withTimezone: true })
        .notNull()
        .defaultNow(),
    updatedAt: timestamp('updatedAt', { withTimezone: true })
        .notNull()
        .defaultNow(),
}, (table) => [
    index('todos_ownerId_createdAt_idx').on(table.ownerId, table.createdAt),
]);
