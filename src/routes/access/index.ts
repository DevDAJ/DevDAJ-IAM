import Elysia from "elysia"

const roles = new Elysia({ prefix: '/roles' })
    .post('/', async () => { })
    .get('/', async () => { })
    .get('/:id', async () => { })
    .patch('/:id', async () => { })
    .delete('/:id', async () => { })
    // Permissions management for roles
    .post('/:id/permissions', async () => { })
    .delete('/:id/permissions', async () => { })

const permissions = new Elysia({ prefix: '/permissions' })
    .post('/', async () => { })
    .get('/', async () => { })
    .get('/:id', async () => { })
    .patch('/:id', async () => { })
    .delete('/:id', async () => { })

export default new Elysia()
    .use(roles)
    .use(permissions)
