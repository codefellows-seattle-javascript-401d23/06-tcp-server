'use strict';

require('dotenv').config();

if (!process.env.NODE_ENV) {
  throw new Error('Undefined NODE_ENV');
}

// Zachary - Loading Babel in development setting
if (process.env.NODE_ENV !== 'production') {
  require('babel-register');
}

// Zachary - transpiling all our application
require('./main');
