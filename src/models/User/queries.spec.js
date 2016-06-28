/* eslint-env mocha */
/* global expect */
import { graphql } from 'graphql'

import schema from '../../schema'
import { createLoaders } from '../helpers'
import User from './model'

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

describe('User Queries Tests', () => {
  describe('Basic Queries', () => {
    it('Returns a user given its global id', async () => {
      const query = `
        {
          user(id: "User(3c93786230569de834c64f93)") {
            id
            name
            email
          }
        }
      `
      const expected = {
        data: {
          user: {
            id: 'User(3c93786230569de834c64f93)',
            name: 'H.G. Wells',
            email: 'wells@graphql.org'
          }
        }
      }

      const result = await graphql(schema, query, null, context)

      expect(result).to.be.deep.equal(expected)
    })

    it('Returns null if no user is found', async () => {
      const query = `
        {
          notFound: user(id: "User(0123456789abcdef01234567)") {
            name
          }
          notUser: user(id: "Story(29ca2bda1b2c6b824aae3571)") {
            name
          }
          notGid: user(id: "3c93786230569de834c64f93") {
            name
          }
        }
      `
      const expected = {
        data: {
          notFound: null,
          notUser: null,
          notGid: null
        },
        errors: [
          { status: 404, message: 'User not found' },
          { status: 404, message: 'That’s not a user' },
          { status: 400, message: 'Expected a global id' }
        ]
      }

      const result = await graphql(schema, query, null, context)
      formatErrors(result)

      expect(result).to.be.deep.equal(expected)
    })

    it('Returns a list of users', async () => {
      const query = `
        {
          users {
            name
          }
        }
      `
      const expected = {
        data: {
          users: [
            { name: 'H.G. Wells' },
            { name: 'Edgar Allan Poe' },
            { name: 'Jules Verne' },
            { name: 'Ian Fleming' }
          ]
        }
      }

      const result = await graphql(schema, query, null, context)

      expect(result).to.be.deep.equal(expected)
    })
  })

  describe('Nested Queries', () => {
    it('Returns a list of stories told by a user', async () => {
      const query = `
        {
          user(id: "User(d742aeac61abb98f5133ab45)") {
            name
            stories {
              id
            }
          }
        }
      `
      const expected = {
        data: {
          user: {
            name: 'Jules Verne',
            stories: [
              { id: 'Story(29ca2bda1b2c6b824aae3571)' },
              { id: 'Story(24373f3c5ec9bcf5675944fd)' }
            ]
          }
        }
      }

      const result = await graphql(schema, query, null, context)

      expect(result).to.be.deep.equal(expected)
    })
  })

  describe('Authentication Queries', () => {
    let token

    it('Returns a JSON Web Token for authentication', async () => {
      const query = `
        {
          token(email: "fleming@graphql.org", password: "fleming")
        }
      `

      const result = await graphql(schema, query, null, context)
      token = result.data.token

      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())

      expect(payload.id).to.be.equal('5331ef9454b7d7fe67f9a258')
    })

    it('Returns no token if credentials are incorrect', async () => {
      const query = `
        {
          userNotFound: token(email: "flaming@graphql.org", password: "fleming")
          incorrectPassword: token(email: "fleming@graphql.org", password: "flaming")
        }
      `
      const expected = {
        data: {
          userNotFound: null,
          incorrectPassword: null
        },
        errors: [
          { status: 401, message: 'Unable to generate token' },
          { status: 401, message: 'Unable to generate token' }
        ]
      }

      const result = await graphql(schema, query, null, context)
      formatErrors(result)

      expect(result).to.be.deep.equal(expected)
    })

    it('Returns the viewer of currently logged in user', async () => {
      const query = `
        {
          viewer {
            id
            name
            email
          }
        }
      `
      const expected = {
        data: {
          viewer: {
            id: 'User(5331ef9454b7d7fe67f9a258)',
            name: 'Ian Fleming',
            email: 'fleming@graphql.org'
          }
        }
      }

      const viewer = User.verifyToken(token)
      const loaders = createLoaders(viewer)
      const context = { viewer, loaders }
      const result = await graphql(schema, query, null, context)

      expect(result).to.be.deep.equal(expected)
    })

    it('Returns no viewer if no user is logged in', async () => {
      const query = `
        {
          viewer {
            id
            name
            email
          }
        }
      `
      const expected = {
        data: {
          viewer: null
        },
        errors: [
          { status: 401, message: 'You’re not logged in' }
        ]
      }

      const result = await graphql(schema, query, null, context)
      formatErrors(result)

      expect(result).to.be.deep.equal(expected)
    })
  })
})
