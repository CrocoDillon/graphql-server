// @flow
import bcrypt from 'bcrypt'
import jsonwebtoken from 'jsonwebtoken'
import { assert, randomId } from '../helpers'
import data from '../../../data.json'

const BCRYPT_SALT_ROUNDS = 10
const JWT_SECRET = 'top secret keyboard cat'

export default class User {

  id: string;
  name: string;
  email: string;
  password: string;
  stories: Array<string>;

  constructor({ id, name, email, password, stories }) {
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

User.gen = async function gen(viewer: ?Object, ids: Array<string>): Promise<Array<?User>> {
  return ids.map(id => {
    const userData = data.users[id]
    return userData ? new User(userData) : null
  })
}

User.find = async function find(viewer: ?Object): Promise<Array<User>> {
  return Object.values(data.users).map(userData => new User(userData))
}

User.encryptPassword = function encryptPassword(password) {
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

User.validatePassword = function validatePassword(password, hash) {
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

User.getToken = async function getToken(email, password) {
  const user = Object.values(data.users).find(user => user.email === email)
  assert(user, 'Unable to generate token') // Don’t leak any details

  const valid = await User.validatePassword(password, user.password)
  assert(valid, 'Unable to generate token') // Don’t leak any details

  return jsonwebtoken.sign({
    id: user.id,
    name: user.name,
    roles: user.roles
  }, JWT_SECRET)
}

User.verifyToken = function verifyToken(token) {
  try {
    return jsonwebtoken.verify(token, JWT_SECRET, { algorithms: ['HS256'] })
  } catch (e) {
    return null
  }
}
