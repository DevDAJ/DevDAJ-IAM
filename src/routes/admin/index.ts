import Elysia from "elysia"

export default new Elysia({ prefix: '/admin', tags: ['admin'] })
    .get('/users', async () => { })
    .get('/users/:id', async () => { })
    .post('/users/:id/ban', async () => { })
    .post('/users/:id/unban', async () => { })
    .post('/users/:id/revoke-token', async () => { })
    .get('/logs', async () => { })
