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

describe('Story Mutation Tests', () => {
  let id

  describe('Create Story', () => {
    it('Creates a new story', async () => {
      const query = `
        mutation CreateStory {
          createStory(author: "User(5331ef9454b7d7fe67f9a258)", body: "Casino Royale") {
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
              id: 'User(5331ef9454b7d7fe67f9a258)'
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
