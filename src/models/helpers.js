// @flow
import { GraphQLNonNull, GraphQLID } from 'graphql'
import DataLoader from 'dataloader'

import User from './User'
import Story from './Story'

const types = ['User', 'Story']
const idRe = /^[0-9a-f]{24}$/
const gidRe = /^(User|Story)\(([0-9a-f]{24})\)$/

export function assert(value: mixed, status: number, message: string): void {
  if (value) {
    return
  }

  const e: Object = new Error(message)
  e.status = status
  throw e
}

export function createGidField(type: string): Object {
  assert(types.includes(type), 400, 'Expected a type')

  return {
    description: 'Globally unique id',
    type: new GraphQLNonNull(GraphQLID),
    resolve: source => toGid(type, source.id)
  }
}

export function toGid(type: string, id: string): string {
  assert(types.includes(type), 400, 'Expected a type')
  assert(idRe.test(id), 400, 'Expected an id')

  return `${ type }(${ id })`
}

export function fromGid(gid: string): { type: string, id: string } {
  const match: any = gid.match(gidRe)
  assert(match, 400, 'Expected a global id')

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
