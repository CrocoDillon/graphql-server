/* eslint-env mocha */
/* global expect */
import { graphql } from 'graphql'

import schema from '../../schema'
import { createLoaders } from '../helpers'

const loaders = createLoaders(null)
const context = { loaders }

describe('User Queries Tests', () => {
  describe('Basic Queries', () => {
    it('Returns a user given its global id...', async () => {
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

    it.skip('...unless no user is found', async () => {
      // TODO
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
    it.skip('Returns a JSON Web Token for authentication...', async () => {
      // TODO
    })

    it.skip('...unless credentials are incorrect', async () => {
      // TODO
    })

    it.skip('Returns the currently logged in user...', async () => {
      // TODO
    })

    it.skip('...unless no user is logged in', async () => {
      // TODO
    })
  })
})
