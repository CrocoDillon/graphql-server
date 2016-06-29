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

describe('Node Query Tests', () => {
  describe('Basic Queries', () => {
    it('Returns a user given its global id', async () => {
      const query = `
        {
          node(id: "User(3c93786230569de834c64f93)") {
            ...UserFragment
          }
        }
        fragment UserFragment on User {
          id
          name
          email
        }
      `
      const expected = {
        data: {
          node: {
            id: 'User(3c93786230569de834c64f93)',
            name: 'H.G. Wells',
            email: 'wells@graphql.org'
          }
        }
      }

      const result = await graphql(schema, query, null, context)

      expect(result).to.be.deep.equal(expected)
    })

    it('Returns a story given its global id', async () => {
      const query = `
        {
          node(id: "Story(5cbba191905f6160f4b39365)") {
            ...StoryFragment
          }
        }
        fragment StoryFragment on Story {
          id
          body
        }
      `
      const expected = {
        data: {
          node: {
            id: 'Story(5cbba191905f6160f4b39365)',
            body: 'The Island of Doctor Moreau'
          }
        }
      }

      const result = await graphql(schema, query, null, context)

      expect(result).to.be.deep.equal(expected)
    })

    it('Returns null if no node is found', async () => {
      const query = `
        {
          notFound: node(id: "User(0123456789abcdef01234567)") {
            id
          }
          notGid: node(id: "3c93786230569de834c64f93") {
            id
          }
        }
      `
      const expected = {
        data: {
          notFound: null,
          notGid: null
        },
        errors: [
          { status: 404, message: 'Node not found' },
          { status: 400, message: 'Expected a global id' }
        ]
      }

      const result = await graphql(schema, query, null, context)
      formatErrors(result)

      expect(result).to.be.deep.equal(expected)
    })
  })

  describe('Resolving Type', () => {
    it('Resolves to correct type for users', async () => {
      const query = `
        {
          node(id: "User(d742aeac61abb98f5133ab45)") {
            __typename
          }
        }
      `
      const expected = {
        data: {
          node: {
            __typename: 'User'
          }
        }
      }

      const result = await graphql(schema, query, null, context)

      expect(result).to.be.deep.equal(expected)
    })

    it('Resolves to correct type for stories', async () => {
      const query = `
        {
          node(id: "Story(ed0fdb79505bbdaa7bafc609)") {
            __typename
          }
        }
      `
      const expected = {
        data: {
          node: {
            __typename: 'Story'
          }
        }
      }

      const result = await graphql(schema, query, null, context)

      expect(result).to.be.deep.equal(expected)
    })
  })
})
