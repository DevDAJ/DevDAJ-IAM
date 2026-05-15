import Elysia from "elysia"

export default new Elysia({ prefix: '/service' })
    .post('/tokens', async () => { })
    .post('/api/service/tokens/:tokenId/rotate', async () => { })
    .delete('/api/service/tokens/:tokenId', async () => { })
