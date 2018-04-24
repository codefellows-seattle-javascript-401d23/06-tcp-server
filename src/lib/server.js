'use strict';

const net = require('net');
const logger = require('./logger');

// ---------------------------------
const app = net.createServer();
let clients = [];
// ---------------------------------

app.on('connection', (socket) => {
  logger.log(logger.INFO, 'new socket');
  //clients.push(socket);
  socket.write('welcome to the chat!\n');
  // socket.name =
  //socket.write(`Your name is ${socket.name}\n`);
//----------------------------------
//events
//-------------------
// socket.on('data', (data) => {
//   const message = data.toString().trim();
// logger.log(logger.INFO, `processing a message: ${message});
// })

});

const server = module.exports = {};

server.start = () => {
  if (!process.env.PORT) {
    logger.log(logger.ERROR, 'missing PORT');
    throw new Error('missing PORT');
  }
  logger.log(logger.INFO, `server is up on port ${process.env.PORT}`);
  return app.listen({ port: process.env.PORT }, () => {});
};
server.stop = () => {
  logger.log(logger.INFO, 'Server is offline');
  return app.close(() => {});
};