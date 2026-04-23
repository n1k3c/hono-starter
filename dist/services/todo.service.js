import { and, eq, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { todos } from '../db/schema.js';
import { BadRequestError, NotFoundError } from '../exceptions/http-exceptions.js';
const getTxId = async (tx) => {
    const result = await tx.execute(sql `SELECT pg_current_xact_id()::xid::text::int as txid`);
    return result.rows[0].txid;
};
export const todoService = {
    async create(data, userId) {
        return db.transaction(async (tx) => {
            const [todo] = await tx
                .insert(todos)
                .values({ id: data.id, title: data.title, completed: false, ownerId: userId })
                .returning();
            const txid = await getTxId(tx);
            return { todo, txid };
        });
    },
    async update(id, data, userId) {
        if (Object.keys(data).length === 0) {
            throw new BadRequestError('At least one field must be provided');
        }
        return db.transaction(async (tx) => {
            const existing = await tx
                .select({ id: todos.id })
                .from(todos)
                .where(and(eq(todos.id, id), eq(todos.ownerId, userId)))
                .limit(1);
            if (existing.length === 0) {
                throw new NotFoundError('Todo');
            }
            const [todo] = await tx
                .update(todos)
                .set(data)
                .where(eq(todos.id, id))
                .returning();
            const txid = await getTxId(tx);
            return { todo, txid };
        });
    },
    async delete(id, userId) {
        return db.transaction(async (tx) => {
            const existing = await tx
                .select({ id: todos.id })
                .from(todos)
                .where(and(eq(todos.id, id), eq(todos.ownerId, userId)))
                .limit(1);
            if (existing.length === 0) {
                throw new NotFoundError('Todo');
            }
            const [todo] = await tx
                .delete(todos)
                .where(eq(todos.id, id))
                .returning();
            const txid = await getTxId(tx);
            return { todo, txid };
        });
    },
};
