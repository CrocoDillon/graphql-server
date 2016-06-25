// @flow
import { GraphQLObjectType, GraphQLNonNull, GraphQLString } from 'graphql'

import { NodeInterface } from '../Node'
import { UserType } from '../User'
import { createGidField } from '../helpers'

const StoryType = new GraphQLObjectType({
  name: 'Story',
  description: 'A story told by a user',
  interfaces: () => [NodeInterface],
  fields: () => ({
    id: createGidField('Story'),
    author: {
      description: 'The user that authored this story',
      type: UserType,
      resolve: (story, args, { loaders }) => loaders['User'].load(story.author)
    },
    body: {
      description: 'The content of this story',
      type: new GraphQLNonNull(GraphQLString)
    }
  })
})

export default StoryType
