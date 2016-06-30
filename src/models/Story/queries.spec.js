/* eslint-env mocha */
/* global expect */
import { graphql } from 'graphql'

import schema from '../../schema'
import { createLoaders } from '../helpers'
import Story from './model'

const loaders = createLoaders(null)
const context = { loaders }

function formatErrors(result) {
  if (result.errors) {
    result.errors = result.errors
      // Sort on line number
      .sort((e1, e2) => e1.locations[0].line - e2.locations[0].line)
      // Return status and message of original error
      .map(({ originalError: { status, message } }) => ({ status, message }))
  }
}

describe('Story Query Tests', () => {
  describe('Basic Queries', () => {
    it('Returns a story given its global id', async () => {
      const query = `
        {
          story(id: "Story(24373f3c5ec9bcf5675944fd)") {
            id
            body
          }
        }
      `
      const expected = {
        data: {
          story: {
            id: 'Story(24373f3c5ec9bcf5675944fd)',
            body: 'Twenty Thousand Leagues Under the Sea'
          }
        }
      }

      const result = await graphql(schema, query, null, context)

      expect(result).to.be.deep.equal(expected)
    })

    it('Returns null if no story is found', async () => {
      const query = `
        {
          notFound: story(id: "Story(0123456789abcdef01234567)") {
            body
          }
          notStory: story(id: "User(5331ef9454b7d7fe67f9a258)") {
            body
          }
          notGid: story(id: "5cbba191905f6160f4b39365") {
            body
          }
        }
      `
      const expected = {
        data: {
          notFound: null,
          notStory: null,
          notGid: null
        },
        errors: [
          { status: 404, message: 'Story not found' },
          { status: 404, message: 'That’s not a story' },
          { status: 400, message: 'Expected a global id' }
        ]
      }

      const result = await graphql(schema, query, null, context)
      formatErrors(result)

      expect(result).to.be.deep.equal(expected)
    })

    it('Returns a list of stories', async () => {
      const query = `
        {
          stories {
            body
          }
        }
      `
      const expected = {
        data: {
          stories: [
            { body: 'The Time Machine' },
            { body: 'The Island of Doctor Moreau' },
            { body: 'Journey to the Center of the Earth' },
            { body: 'The War of the Worlds' },
            { body: 'Twenty Thousand Leagues Under the Sea' }
          ]
        }
      }

      const result = await graphql(schema, query, null, context)

      expect(result).to.be.deep.equal(expected)
    })
  })

  describe('Nested Queries', () => {
    it('Returns the user that authored a story', async () => {
      const query = `
        {
          story(id: "Story(ed0fdb79505bbdaa7bafc609)") {
            author {
              id
            }
            body
          }
        }
      `
      const expected = {
        data: {
          story: {
            author: {
              id: 'User(3c93786230569de834c64f93)'
            },
            body: 'The War of the Worlds'
          }
        }
      }

      const result = await graphql(schema, query, null, context)

      expect(result).to.be.deep.equal(expected)
    })
  })
})
