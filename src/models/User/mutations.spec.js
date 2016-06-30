/* eslint-env mocha */
/* global expect */
import { graphql } from 'graphql'

import schema from '../../schema'
import { createLoaders } from '../helpers'

const loaders = createLoaders(null)
const context = { loaders }

describe('User Mutation Tests', () => {
  let id

  describe('Create User', () => {
    it('Creates a new user', async () => {
      const query = `
        mutation CreateUser {
          createUser(name: "George Orwell", email: "orwell@graphql.org", password: "orwell") {
            id
            name
            email
            stories {
              id
            }
          }
        }
      `
      const expected = {
        data: {
          createUser: {
            name: 'George Orwell',
            email: 'orwell@graphql.org',
            stories: []
          }
        }
      }

      const result = await graphql(schema, query, null, context)

      id = result.data.createUser.id
      expected.data.createUser.id = id

      expect(id).to.match(/^User\(([0-9a-f]{24})\)$/)
      expect(result).to.be.deep.equal(expected)
    })
  })

  describe('Update User', () => {
    it('Updates an existing user', async () => {
      const query = `
        mutation UpdateUser {
          updateUser(id: "${ id }", name: "G. Orwell") {
            id
            name
          }
        }
      `
      const expected = {
        data: {
          updateUser: {
            id,
            name: 'G. Orwell'
          }
        }
      }

      const result = await graphql(schema, query, null, context)

      expect(result).to.be.deep.equal(expected)
    })
  })

  describe('Delete User', () => {
    it('Deletes an existing user', async () => {
      const query = `
        mutation DeleteUser {
          deleteUser(id: "${ id }") {
            id
            name
            email
          }
        }
      `
      const expected = {
        data: {
          deleteUser: {
            id,
            name: 'G. Orwell',
            email: 'orwell@graphql.org'
          }
        }
      }

      const result = await graphql(schema, query, null, context)

      expect(result).to.be.deep.equal(expected)
    })
  })
})
