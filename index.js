'use strict';

require('dotenv').config();

if (!process.env.NODE_ENV) {
  throw new Error('NODE_ENV Undefined');
}

if (process.env.NODE_ENV !== 'production') {
  require('babel-register');
}

require('./src/main');
