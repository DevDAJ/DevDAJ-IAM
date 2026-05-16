import Elysia from 'elysia';
import user from './users';
import app from './apps';
import access from './access';
import oauth from './oauth';
import internal from './internal';
import admin from './admin';
import { auth } from '../utils/auth';


const base = new Elysia()
    .use(oauth)
    .use(internal)

const api = new Elysia({ prefix: '/api/v1' })
    .mount(auth.handler)
    .use(user)
    .use(app)
    .use(access)
    .use(admin)

export default new Elysia()

    .use(api)
    .use(base)