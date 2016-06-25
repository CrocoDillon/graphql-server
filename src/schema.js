// @flow
import { GraphQLObjectType, GraphQLSchema } from 'graphql'

import { node, token, user, users, createUser, updateUser, deleteUser, story, stories, createStory, updateStory, deleteStory } from './models'

const query = new GraphQLObjectType({
  name: 'Query',
  description: 'GraphQL root for queries',
  fields: () => ({
    node,
    token,
    user,
    users,
    story,
    stories
  })
})

const mutation = new GraphQLObjectType({
  name: 'Mutation',
  description: 'GraphQL root for mutations',
  fields: () => ({
    createUser,
    updateUser,
    deleteUser,
    createStory,
    updateStory,
    deleteStory
  })
})

const schema = new GraphQLSchema({
  query,
  mutation
})

export default schema
