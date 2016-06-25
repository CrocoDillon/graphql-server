// @flow
import { randomId } from '../helpers'
import data from '../../../data.json'

export default class Story {

  id: string;
  author: string;
  body: string;

  constructor({ id, author, body }: Object) {
    this.id = id || randomId()

    this.author = author
    this.body = body
  }

  save() {
    data.stories[this.id] = this.serialize()
  }

  remove() {
    delete data.stories[this.id]
  }

  serialize() {
    return {
      id: this.id,
      author: this.author,
      body: this.body
    }
  }
}

Story.gen = async function gen(viewer: ?Object, ids: Array<string>): Promise<Array<?Story>> {
  return ids.map(id => {
    const storyData = data.stories[id]
    return storyData ? new Story(storyData) : null
  })
}

Story.find = async function find(viewer: ?Object): Promise<Array<Story>> {
  return Object.values(data.stories).map(storyData => new Story(storyData))
}
