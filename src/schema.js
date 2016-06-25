// @flow
import { GraphQLObjectType, GraphQLSchema } from 'graphql'

import { nodeQueries, userQueries, userMutations, storyQueries, storyMutations } from './models'

const query = new GraphQLObjectType({
  name: 'Query',
  description: 'GraphQL root for queries',
  fields: () => ({
    ...nodeQueries,
    ...userQueries,
    ...storyQueries
  })
})

const mutation = new GraphQLObjectType({
  name: 'Mutation',
  description: 'GraphQL root for mutations',
  fields: () => ({
    ...userMutations,
    ...storyMutations
  })
})

const schema = new GraphQLSchema({
  query,
  mutation
})

export default schema
