import Elysia from "elysia";

const oauthService = new Elysia({ prefix: '/oauth' })
    .get('/oauth/authorize', async () => { })
    .post('/oauth/token', async () => { })
    .post('/oauth/revoke', async () => { })
    .get('/oauth/introspect', async () => { })
    .get('/oauth/userinfo', async () => { })

const wellKnownService = new Elysia({ prefix: '/.well-known' })
    .get('/openid-configuration', async () => { })
    .get('/jwks.json', async () => { })

export default new Elysia()
    .use(oauthService)
    .use(wellKnownService)