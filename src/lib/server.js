'use strict';

const net = require('net');
const logger = require('./logger');


const app = net.createServer();

app.on('connection', (socket) => {
  logger.log(logger.INFO, 'new socket');
  socket.write('welcome to the chat!\n');
});

const server = module.exports = {};

server.start = () => {
  if (!process.env.PORT) {
    logger.log(logger.ERROR, 'missing PORT');
    throw new Error('missing PORT');
  }
  logger.log(logger.INFO, `server is up on port ${process.env.PORT}`);
};
