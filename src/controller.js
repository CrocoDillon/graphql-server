// @flow
import path from 'path'
import fs from 'fs'
import { graphql, formatError } from 'graphql'
import DataLoader from 'dataloader'

import schema from './schema'
import { User, Story } from './models'

const graphiql = fs.readFileSync(path.join(__dirname, 'graphiql.html'), 'utf8')

export default async function controller(ctx: KoaContext): Promise<void> {
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

function getGraphQLParams(ctx: KoaContext): GraphQLParams {
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

function createLoaders(viewer: ?Object): Object {
  return {
    User: new DataLoader(ids => User.gen(viewer, ids)),
    Story: new DataLoader(ids => Story.gen(viewer, ids))
  }
}
