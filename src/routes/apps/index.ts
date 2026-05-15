import Elysia from "elysia"

export default new Elysia({ prefix: '/apps' })
    .get('/', async () => { })
    .post('/', async () => { })
    .get('/:id', async () => { })
    .patch('/:id', async () => { })
    .delete('/:id', async () => { })
    .post('/:id/rotate-secret', async () => { })
    .post('/:id/redirect-uris', async () => { })
    .delete('/:id/redirect-uris', async () => { })
