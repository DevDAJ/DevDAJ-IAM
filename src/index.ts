import { Elysia } from 'elysia'
import config from './utils/config'

new Elysia()
  .use(config)
  .listen(process.env.PORT || 3000, () => {
    console.log('Server is running on port 3000')
  })
