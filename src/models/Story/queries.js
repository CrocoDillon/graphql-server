// @flow
import { GraphQLNonNull, GraphQLID, GraphQLList } from 'graphql'

import Story from './model'
import StoryType from './types'
import { assert, fromGid } from '../helpers'

export const story = {
  description: 'Returns a story given its global id',
  type: StoryType,
  args: {
    id: {
      description: 'The global id of a story',
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve: async (source: Object, args: Object, { loaders }: Object) => {
    const { id } = fromGid(args.id)
    const story = await loaders['Story'].load(id)

    assert(story, 404, 'Story not found')

    return story
  }
}

export const stories = {
  description: 'Returns a list of stories',
  type: new GraphQLList(StoryType),
  resolve: ({ viewer }: Object) => Story.find(viewer)
}
