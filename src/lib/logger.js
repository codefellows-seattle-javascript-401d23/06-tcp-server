'use strict';

const winston = require('winston');

const logger = module.exports = winston.createLogger({
  level: 'info',
  format: winston.format.json(), // format into json
  transports: [ // destination where all our logs go to
    new winston.transports.File({ filename: 'log.log', level: 'verbose' }),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.Console({ format: winston.format.simple(), level: 'info' }),
  ],
});
// Delete this
logger.INFO = 'info';
logger.ERROR = 'error';
logger.VERBOSE = 'verbose';
