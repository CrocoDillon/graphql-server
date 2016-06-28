// @flow
import { GraphQLNonNull, GraphQLID, GraphQLString, GraphQLList } from 'graphql'

import User from './model'
import UserType from './types'
import { assert, fromGid } from '../helpers'

export const token = {
  description: 'Returns a JSON Web Token for authentication',
  type: GraphQLString,
  args: {
    email: {
      description: 'The user’s email address',
      type: new GraphQLNonNull(GraphQLString)
    },
    password: {
      description: 'The user’s password',
      type: new GraphQLNonNull(GraphQLString)
    }
  },
  resolve: (source, { email, password }) => User.getToken(email, password)
}

export const viewer = {
  description: 'Returns the currently logged in user',
  type: UserType,
  resolve: async (source, args, { viewer, loaders }) => {
    assert(viewer, 401, 'You’re not logged in')
    return await loaders['User'].load(viewer.id)
  }
}

export const user = {
  description: 'Returns a user given its global id',
  type: UserType,
  args: {
    id: {
      description: 'The global id of a user',
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve: async (source, args, { loaders }) => {
    const { type, id } = fromGid(args.id)
    assert(type === 'User', 404, 'That’s not a user')

    const user = await loaders['User'].load(id)
    assert(user, 404, 'User not found')

    return user
  }
}

export const users = {
  description: 'Returns a list of users',
  type: new GraphQLList(UserType),
  resolve: (source, args, { viewer }) => User.find(viewer)
}
