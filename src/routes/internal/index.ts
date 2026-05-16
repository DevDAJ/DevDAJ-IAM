import Elysia from "elysia"

export default new Elysia({ prefix: '/internal', tags: ['audit'] })
    .get('/health', async () => { })
    .get('/metrics', async () => { })
    .post('/rotate-keys', async () => { })
