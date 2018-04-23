'use strict';

const net = require('net');
const logger = require('./logger');

const app = net.createServer();
let users = [];

const server = module.exports = {};

server.start = () => {
  if (!process.env.PORT) {
    logger.log(logger.ERROR, 'Port undefined');
    throw new Error('Port undefined');
  }
  logger.log(logger.INFO, `Server listening on port ${process.env.PORT}`);
  return app.listen({ port: process.env.PORT }, () => {});
};

server.stop = () => {
  logger.log(logger.INFO, 'Server is offline');
  return app.close(() => {});
};
