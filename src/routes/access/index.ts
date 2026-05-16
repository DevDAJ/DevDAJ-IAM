import Elysia from "elysia"

const roles = new Elysia({ prefix: '/roles', tags: ['role'] })
    .post('/', async () => { })
    .get('/', async () => { })
    .get('/:id', async () => { })
    .patch('/:id', async () => { })
    .delete('/:id', async () => { })
    // Permissions management for roles
    .post('/:id/permissions', async () => { })
    .delete('/:id/permissions', async () => { })

const permissions = new Elysia({ prefix: '/permissions', tags: ['permission'] })
    .post('/', async () => { })
    .get('/', async () => { })
    .get('/:id', async () => { })
    .patch('/:id', async () => { })
    .delete('/:id', async () => { })

export default new Elysia()
    .use(roles)
    .use(permissions)
