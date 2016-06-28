// @flow
import path from 'path'
import fs from 'fs'
import { graphql, formatError } from 'graphql'

import schema from './schema'
import { User } from './models'
import { createLoaders } from './models/helpers'

const graphiql = fs.readFileSync(path.join(__dirname, 'graphiql.html'), 'utf8')

export default async function controller(ctx: Object): Promise<void> {
  if (ctx.method === 'GET' && ctx.accepts('html')) {
    // GraphiQL! \o/
    ctx.body = graphiql
    return
  }

  const { authorization } = ctx.header
  const { query, variables, operationName } = getGraphQLParams(ctx)

  const viewer = verifyViewer(authorization)
  const loaders = createLoaders(viewer)
  const context = { viewer, loaders }

  const result = await graphql(schema, query, null, context, variables, operationName)

  if (result.errors) {
    // TODO: Log errors so we can fix them
    result.errors = result.errors.map(formatError)
  }

  ctx.body = result
}

function getGraphQLParams(ctx: Object): Object {
  let { query, variables, operationName } = ctx.method === 'GET' ?
    ctx.request.query :
    ctx.request.body

  if (typeof variables === 'string') {
    try {
      variables = JSON.parse(variables)
    } catch (e) {
      ctx.throw(400, 'Variables are invalid JSON')
    }
  }

  return { query, variables, operationName }
}

function verifyViewer(authorization: ?string): ?Object {
  if (!authorization)  return null

  const [scheme, token, ...rest] = authorization.split(' ')

  if (scheme !== 'Bearer' || rest.length !== 0) {
    return null
  }

  return User.verifyToken(token)
}
