// @flow
/* eslint no-use-before-define: 0 */
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import jsonwebtoken from 'jsonwebtoken'

import { assert } from '../helpers'

const BCRYPT_SALT_ROUNDS = 10
const JWT_SECRET = 'top secret keyboard cat'

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  stories: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Story'
  }]
})

UserSchema.statics.gen = async function gen(viewer: ?Object, ids: Array<string>): Promise<Array<?User>> {
  return Promise.all(ids.map(id => User.findById(id).exec()))
}

UserSchema.statics.find = async function find(viewer: ?Object): Promise<Array<User>> { // eslint-disable-line no-unused-vars
  return mongoose.Model.find.call(this).sort('_id').exec()
}

UserSchema.statics.encryptPassword = function encryptPassword(password) {
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

UserSchema.statics.validatePassword = function validatePassword(password, hash) {
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

UserSchema.statics.getToken = async function getToken(email, password) {
  const user = await User.findOne({ email }).exec()
  assert(user, 401, 'Unable to generate token') // Don’t leak any details

  const valid = await User.validatePassword(password, user.password)
  assert(valid, 401, 'Unable to generate token') // Don’t leak any details

  return jsonwebtoken.sign({
    id: user.id,
    name: user.name
  }, JWT_SECRET)
}

UserSchema.statics.verifyToken = function verifyToken(token) {
  try {
    return jsonwebtoken.verify(token, JWT_SECRET, { algorithms: ['HS256'] })
  } catch (e) {
    return null
  }
}

const User = mongoose.model('User', UserSchema, 'users')

export default User
