// @flow
import { GraphQLInterfaceType, GraphQLNonNull, GraphQLID } from 'graphql'
import User, { UserType } from '../User'
import Story, { StoryType } from '../Story'

const NodeInterface = new GraphQLInterfaceType({
  name: 'Node',
  description: 'A node with a globally unique id',
  fields: () => ({
    id: {
      description: 'Globally unique id',
      type: new GraphQLNonNull(GraphQLID)
    }
  }),
  resolveType: node => {
    if (node instanceof User)
      return UserType
    if (node instanceof Story)
      return StoryType

    return null
  }
})

export default NodeInterface
