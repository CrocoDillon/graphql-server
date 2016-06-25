// @flow
import { GraphQLNonNull, GraphQLID, GraphQLString } from 'graphql'

import User from './model'
import UserType from './types'
import { assert, fromGid } from '../helpers'

export const createUser = {
  type: UserType,
  args: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
    password: { type: new GraphQLNonNull(GraphQLString) }
  },
  resolve: async ({ loaders }, args) => {
    const user = new User({
      ...args,
      password: await User.encryptPassword(args.password)
    })
    user.save()
    return user
  }
}

export const updateUser = {
  type: UserType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    password: { type: GraphQLString }
  },
  resolve: async ({ loaders }, args) => {
    const { type, id } = fromGid(args.id)
    const user = await loaders['User'].load(id)

    assert(user, `${ args.id } not found`)

    if (args.name)
      user.name = args.name
    if (args.email)
      user.email = args.email
    if (args.password)
      user.password = await User.encryptPassword(args.password)

    user.save()
    return user
  }
}

export const deleteUser = {
  type: UserType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) }
  },
  resolve: async ({ loaders }, args) => {
    const { type, id } = fromGid(args.id)
    const user = await loaders['User'].load(id)

    assert(user, `${ args.id } not found`)

    user.remove()
    return user
  }
}
