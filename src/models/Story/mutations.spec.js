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

describe('Story Mutation Tests', () => {
  let id

  describe('Create Story', () => {
    it('Creates a new story', async () => {
      const query = `
        mutation CreateStory {
          createStory(author: "User(5779131ce6d02601dd2fc488)", body: "Casino Royale") {
            id
            author {
              id
            }
            body
          }
        }
      `
      const expected = {
        data: {
          createStory: {
            author: {
              id: 'User(5779131ce6d02601dd2fc488)'
            },
            body: 'Casino Royale'
          }
        }
      }

      const result = await graphql(schema, query, null, context)

      id = result.data.createStory.id
      expected.data.createStory.id = id

      expect(id).to.match(/^Story\(([0-9a-f]{24})\)$/)
      expect(result).to.be.deep.equal(expected)
    })

    it('Does not create a new story if author is not found', async () => {
      const query = `
        mutation CreateStory {
          createStory(author: "User(0123456789abcdef01234567)", body: "Casino Royale") {
            id
          }
        }
      `
      const expected = {
        data: {
          createStory: null
        },
        errors: [
          { status: 400, message: 'Author not found' }
        ]
      }

      const result = await graphql(schema, query, null, context)
      formatErrors(result)

      expect(result).to.be.deep.equal(expected)
    })

    it('Adds created story to author’s list of stories', async () => {
      const query = `
        {
          user(id: "User(5779131ce6d02601dd2fc488)") {
            name
            stories {
              body
            }
          }
        }
      `
      const expected = {
        data: {
          user: {
            name: 'Ian Fleming',
            stories: [
              { body: 'Casino Royale' }
            ]
          }
        }
      }

      const result = await graphql(schema, query, null, context)

      expect(result).to.be.deep.equal(expected)
    })
  })

  describe('Update Story', () => {
    it('Updates an existing story', async () => {
      const query = `
        mutation UpdateStory {
          updateStory(id: "${ id }", body: "James Bond") {
            id
            body
          }
        }
      `
      const expected = {
        data: {
          updateStory: {
            id,
            body: 'James Bond'
          }
        }
      }

      const result = await graphql(schema, query, null, context)

      expect(result).to.be.deep.equal(expected)
    })
  })

  describe('Delete Story', () => {
    it('Deletes an existing story', async () => {
      const query = `
        mutation DeleteStory {
          deleteStory(id: "${ id }") {
            id
            body
          }
        }
      `
      const expected = {
        data: {
          deleteStory: {
            id,
            body: 'James Bond'
          }
        }
      }

      const result = await graphql(schema, query, null, context)

      expect(result).to.be.deep.equal(expected)
    })
  })
})
