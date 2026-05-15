import Elysia from "elysia"

export default new Elysia({ prefix: '/internal' })
    .get('/health', async () => { })
    .get('/metrics', async () => { })
    .post('/rotate-keys', async () => { })
