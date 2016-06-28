// @flow
import bcrypt from 'bcrypt'
import jsonwebtoken from 'jsonwebtoken'

import { assert, randomId } from '../helpers'
import data from '../../../data.json'

const BCRYPT_SALT_ROUNDS = 10
const JWT_SECRET = 'top secret keyboard cat'

export default class User {

  static async gen(viewer: ?Object, ids: Array<string>): Promise<Array<?User>> {
    return ids.map(id => {
      const userData = data.users[id]
      return userData ? new User(userData) : null
    })
  }

  static async find(viewer: ?Object): Promise<Array<User>> { // eslint-disable-line no-unused-vars
    return Object.values(data.users).map((userData: any) => new User(userData))
  }

  static encryptPassword(password) {
    return new Promise((resolve, reject) => {
      bcrypt.hash(password, BCRYPT_SALT_ROUNDS, (err, hash) => {
        if (err) {
          reject(err)
        } else {
          resolve(hash)
        }
      })
    })
  }

  static validatePassword(password, hash) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, hash, (err, valid) => {
        if (err) {
          reject(err)
        } else {
          resolve(valid)
        }
      })
    })
  }

  static async getToken(email, password) {
    const user: any = Object.values(data.users).find((user: any) => user.email === email)
    assert(user, 401, 'Unable to generate token') // Don’t leak any details

    const valid = await User.validatePassword(password, user.password)
    assert(valid, 401, 'Unable to generate token') // Don’t leak any details

    return jsonwebtoken.sign({
      id: user.id,
      name: user.name
    }, JWT_SECRET)
  }

  static verifyToken(token) {
    try {
      return jsonwebtoken.verify(token, JWT_SECRET, { algorithms: ['HS256'] })
    } catch (e) {
      return null
    }
  }

  id: string;
  name: string;
  email: string;
  password: string;
  stories: Array<string>;

  constructor({ id, name, email, password, stories }: Object) {
    this.id = id || randomId()

    this.name = name
    this.email = email
    this.password = password
    this.stories = stories || []
  }

  save() {
    data.users[this.id] = this.serialize()
  }

  remove() {
    delete data.users[this.id]
  }

  serialize() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      password: this.password,
      stories: this.stories
    }
  }
}
