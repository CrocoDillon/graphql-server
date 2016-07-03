// @flow
/* eslint no-use-before-define: 0 */
import mongoose from 'mongoose'

const StorySchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  body: {
    type: String,
    required: true
  }
})

StorySchema.statics.gen = async function gen(viewer: ?Object, ids: Array<string>): Promise<Array<?Story>> {
  return Promise.all(ids.map(id => Story.findById(id).exec()))
}

StorySchema.statics.find = async function find(): Promise<Array<Story>> {
  return mongoose.Model.find.call(this).sort('_id').exec()
}

const Story = mongoose.model('Story', StorySchema, 'stories')

export default Story
