// @flow
import { GraphQLNonNull, GraphQLID } from 'graphql'
import NodeInterface from './interfaces'
import { fromGid } from '../helpers'

export const node = {
  description: 'Returns a node given its globally unique id',
  type: NodeInterface,
  args: {
    id: {
      description: 'The globally unique id of a node',
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve: ({ loaders }, args) => {
    const { type, id } = fromGid(args.id)
    return loaders[type].load(id)
  }
}
