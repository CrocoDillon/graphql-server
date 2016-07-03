/* eslint-env mocha */
/* global expect */
import { graphql } from 'graphql'

import schema from '../../schema'
import { createLoaders } from '../helpers'

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
          story(id: "Story(577915ebe6d02601dd2fc491)") {
            id
            body
          }
        }
      `
      const expected = {
        data: {
          story: {
            id: 'Story(577915ebe6d02601dd2fc491)',
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
          notStory: story(id: "User(5779131ce6d02601dd2fc486)") {
            body
          }
          notGid: story(id: "577915ebe6d02601dd2fc48e") {
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
            { body: 'The War of the Worlds' },
            { body: 'Twenty Thousand Leagues Under the Sea' },
            { body: 'Journey to the Center of the Earth' }
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
          story(id: "Story(577915ebe6d02601dd2fc490)") {
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
              id: 'User(5779131ce6d02601dd2fc485)'
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
