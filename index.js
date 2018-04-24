'use strict';

require('dotenv').config();

if (!process.env.NODE_ENV) {
  throw new Error('Undefine NODE_ENV');
}

if (process.env.NODE_ENV !== 'production') {
  require('babel-register');
}

require('./src/main');
