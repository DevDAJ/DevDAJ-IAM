import Elysia from "elysia";

export default new Elysia({ prefix: '/users' })
    .get('/', async () => { })
    .get('/me', async () => { })
    .patch('/me', async () => { })
    .post('/me/change-password', async () => { })
    .post('/me/add-password', async () => { })
    .post('/me/link/:provider', async () => { })
    .delete('/me/link/:provider', async () => { })
    .get('/me/sessions', async () => { })
    .delete('/me/sessions/:id', async () => { })
    .get('/api/users/:userId/roles', async () => { })
    .post('/api/users/:userId/roles', async () => { })
    .delete('/api/users/:userId/roles', async () => { })
    .patch('/api/users/:userId/roles', async () => { })

