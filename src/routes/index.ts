import Elysia from 'elysia';
import auth from './auth';
import user from './users';
import app from './apps';
import access from './access';
import oauth from './oauth';


const base = new Elysia()
    .use(oauth)

const api = new Elysia({ prefix: '/api/v1' })
    .use(auth)
    .use(user)
    .use(app)
    .use(access)

export default new Elysia()
    .use(api)
    .use(base)