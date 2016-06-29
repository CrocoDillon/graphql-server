// @flow
import { GraphQLNonNull, GraphQLID } from 'graphql'

import NodeInterface from './interfaces'
import { assert, fromGid } from '../helpers'

export const node = {
  description: 'Returns a node given its globally unique id',
  type: NodeInterface,
  args: {
    id: {
      description: 'The globally unique id of a node',
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve: async (source: Object, args: Object, { loaders }: Object) => {
    const { type, id } = fromGid(args.id)

    const node = await loaders[type].load(id)
    assert(node, 404, 'Node not found')

    return node
  }
}
