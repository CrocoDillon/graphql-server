// @flow
import { randomId } from '../helpers'
import data from '../../../data.json'

export default class Story {

  static async gen(viewer: ?Object, ids: Array<string>): Promise<Array<?Story>> {
    return ids.map(id => {
      const storyData = data.stories[id]
      return storyData ? new Story(storyData) : null
    })
  }

  static async find(): Promise<Array<Story>> {
    return Object.values(data.stories).map((storyData: any) => new Story(storyData))
  }

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
