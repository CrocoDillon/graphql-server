// @flow
import { GraphQLObjectType, GraphQLList, GraphQLNonNull, GraphQLString } from 'graphql'

import { NodeInterface } from '../Node'
import { StoryType } from '../Story'
import { createGidField } from '../helpers'

const UserType = new GraphQLObjectType({
  name: 'User',
  description: 'A registered user',
  interfaces: () => [NodeInterface],
  fields: () => ({
    id: createGidField('User'),
    name: {
      description: 'This user’s full name',
      type: new GraphQLNonNull(GraphQLString)
    },
    email: {
      description: 'This user’s email address',
      type: new GraphQLNonNull(GraphQLString)
    },
    stories: {
      description: 'List of stories told by this user',
      type: new GraphQLList(StoryType),
      resolve: (user, args, { loaders }) => loaders['Story'].loadMany(user.stories)
    }
  })
})

export default UserType
