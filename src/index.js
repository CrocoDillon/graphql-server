// @flow
import Koa from 'koa'
import Router from 'koa-router'
import bodyParser from 'koa-bodyparser'

import controller from './controller'

const app = new Koa()

app.use(bodyParser({
  extendTypes: {
    text: ['application/graphql']
  }
}))

const router = new Router()

router.get('/graphql', controller)
router.post('/graphql', controller)

app.use(router.routes())
app.use(router.allowedMethods())

app.listen(3000, () => {
  console.info('GraphQL server is running!') // eslint-disable-line no-console
})
