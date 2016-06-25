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
  const { query, variables, ...rest } = ctx.request.body

  const viewer = verifyViewer(authorization)
  const loaders = createLoaders(viewer)

  const result = await graphql(schema, query, { ...rest, viewer, loaders }, variables || {})

  if (result.errors) {
    // TODO: Log errors so we can fix them
    result.errors = result.errors.map(formatError)
  }

  ctx.body = result
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
