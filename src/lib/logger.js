'use strict';

const winston = require('winston');
// Josh- above brings winston module into this package

const logger = module.exports = winston.createLogger({
  //Josh- this exports 'logger' to be used in different modules
  level: 'info',
  //Josh- this sends info error messages
  format: winston.format.json(),
  //Josh- this writes the winston format info as a json file
  transports: [
      new winston.transports.File({ filename: 'log.log', level: 'verbose'}),
      //Josh- this sends the error info into the log.log file and all information from verbose thru info
      new winston.transports.Console({ filename: winston.format.simple(), level: 'info'}),
  ],
});

logger.INFO = 'info';
logger.ERROR = 'error';
logger.VERBOSE = 'verbose'