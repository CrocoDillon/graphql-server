// Bootstrap Babel and polyfills
require('core-js/shim')
require('babel-register')

// Ensure correct NODE_ENV
if (process.env.NODE_ENV !== 'test') {
  throw new Error('Running tests require NODE_ENV=test')
}

require('./src/database')

global.expect = require('chai').expect

// Load tests
const glob = require('glob')
glob.sync('./src/**/*.spec.js').forEach(require)
