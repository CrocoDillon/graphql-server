// @flow
import { GraphQLNonNull, GraphQLID, GraphQLString } from 'graphql'

import Story from './model'
import StoryType from './types'
import { assert, fromGid } from '../helpers'

export const createStory = {
  type: StoryType,
  args: {
    author: { type: new GraphQLNonNull(GraphQLID) },
    body: { type: new GraphQLNonNull(GraphQLString) }
  },
  resolve: async (source: Object, args: Object, { loaders }: Object): Promise<Object> => {
    const authorId = fromGid(args.author).id
    const author = await loaders['User'].load(authorId)

    assert(author, 400, 'Author not found')

    const story = new Story({
      ...args,
      author: author.id
    })

    author.stories.push(story.id)
    author.save()

    story.save()
    return story
  }
}

export const updateStory = {
  type: StoryType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    body: { type: new GraphQLNonNull(GraphQLString) }
  },
  resolve: async (source: Object, args: Object, { loaders }: Object): Promise<Object> => {
    const { id } = fromGid(args.id)
    const story = await loaders['Story'].load(id)

    assert(story, 404, 'Story not found')

    story.body = args.body
    story.save()
    return story
  }
}

export const deleteStory = {
  type: StoryType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) }
  },
  resolve: async (source: Object, args: Object, { loaders }: Object): Promise<Object> => {
    const { id } = fromGid(args.id)
    const story = await loaders['Story'].load(id)

    assert(story, 404, 'Story not found')

    const author = await loaders['User'].load(story.author)
    if (author) {
      author.stories = author.stories.filter(sid => sid !== id)
      author.save()
    }

    story.remove()
    return story
  }
}
