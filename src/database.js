import mongoose from 'mongoose'

mongoose.Promise = global.Promise

mongoose.connect('mongodb://localhost:27017/graphql', () => {
  console.info('Database connected') // eslint-disable-line no-console
})
