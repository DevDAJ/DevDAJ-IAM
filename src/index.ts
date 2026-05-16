import { Elysia } from 'elysia'
import config from './utils/config'
import routes from './routes'

new Elysia()
  .use(config)
  .use(routes)
  .listen(process.env.PORT || 3000, () => {
    console.log('Server is running on port 3000')
  })
