import { defineRelations } from 'drizzle-orm';
import { accounts } from './schema/accounts.js';
import { sessions } from './schema/sessions.js';
import { todos } from './schema/todos.js';
import { users } from './schema/users.js';
import { verifications } from './schema/verifications.js';
export { accounts } from './schema/accounts.js';
export { sessions } from './schema/sessions.js';
export { todos } from './schema/todos.js';
export { users } from './schema/users.js';
export { verifications } from './schema/verifications.js';
const schema = { accounts, sessions, todos, users, verifications };
export const relations = defineRelations(schema, (r) => ({
    users: {
        accounts: r.many.accounts({
            from: r.users.id,
            to: r.accounts.userId,
        }),
        sessions: r.many.sessions({
            from: r.users.id,
            to: r.sessions.userId,
        }),
        todos: r.many.todos({
            from: r.users.id,
            to: r.todos.ownerId,
        }),
    },
    sessions: {
        user: r.one.users({
            from: r.sessions.userId,
            to: r.users.id,
        }),
    },
    accounts: {
        user: r.one.users({
            from: r.accounts.userId,
            to: r.users.id,
        }),
    },
    todos: {
        owner: r.one.users({
            from: r.todos.ownerId,
            to: r.users.id,
        }),
    },
}));
