import Elysia from "elysia"

export default new Elysia({ prefix: '/auth' })
    .post('/login', async () => { })
    .post('/register', async () => { })
    .post('/refresh', async () => { })
    .post('/logout', async () => { })
    .get('/oauth/:provider', async () => { })
    .get('/oauth/:provider/callback', async () => { })
    .post('/verify-email', async () => { })
    .post('/forgot-password', async () => { })
    .post('/reset-password', async () => { })
