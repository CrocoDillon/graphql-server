// @flow
import { GraphQLNonNull, GraphQLID } from 'graphql'
import DataLoader from 'dataloader'

import User from './User'
import Story from './Story'

const types = ['User', 'Story']
const idRe = /^[0-9a-f]{24}$/
const gidRe = /^(User|Story)\(([0-9a-f]{24})\)$/

export function assert(value: mixed, message: string): void {
  if (value) return
  throw new Error(message)
}

export function createGidField(type: string): Object {
  assert(types.includes(type), `Expected a type and instead saw '${ type }'`)

  return {
    description: 'Globally unique id',
    type: new GraphQLNonNull(GraphQLID),
    resolve: source => toGid(type, source.id)
  }
}

export function toGid(type: string, id: string): string {
  assert(types.includes(type), `Expected a type and instead saw '${ type }'`)
  assert(idRe.test(id), `Expected an id and instead saw '${ id }'`)

  return `${ type }(${ id })`
}

export function fromGid(gid: string): { type: string, id: string } {
  const match: any = gid.match(gidRe)

  assert(match, `Expected a global id and instead saw '${ gid }'`)

  const [, type, id] = match
  return { type, id }
}

export function randomId(): string {
  const digits = new Array(24)
  for (let i = 0; i < digits.length; i++) {
    digits[i] = Math.floor(16 * Math.random()).toString(16)
  }
  return digits.join('')
}

export function createLoaders(viewer: ?Object): Object {
  return {
    User: new DataLoader(ids => User.gen(viewer, ids)),
    Story: new DataLoader(ids => Story.gen(viewer, ids))
  }
}
