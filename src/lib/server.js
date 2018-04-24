'use strict';

const net = require('net');
const logger = require('./logger');

// ---------------------------------
const app = net.createServer();
const clients = [];
// ---------------------------------

const parseCommand = (message, socket) => {
  if (!message.startsWith('@')) {
    return false;
  }
  const parsedMesage = message.split(' ');
  const command = parsedMessage[0];
  logger.log(logger.INFO, `parsing a command ${command}`);

  // switch
  switch (command) {
    case '@list': {
      const clientNames = clients.map(client => client.name).join('\n');
      break;
    }
    default: {
      socket.write('INVALID COMMAND!');
      break;
    }
    // return true;
  }

  const removeClient = socket => () => {
  // clients = clients.filter(client => client !== socket);
    logger.log(logger.INFO, `Removing ${socket.name}`);
  };
};// parsecommand

app.on('connection', (socket) => {
  logger.log(logger.INFO, 'new socket');
  clients.push(socket);
  socket.write('welcome to the chat! enter a name for yourself!');

  socket.name = 'poop';
  socket.write(`Your name is ${socket.name}\n`);
  // ----------------------------------
  // socket events
  // -------------------
  socket.on('data', (data) => {
    const message = data.toString().trim();

    // data checks 

    logger.log(logger.INFO, `processing a message: ${message}`);

    // command check:

    if (parseCommand(message, socket)) {
      return;
    }// if
    clients.forEach((client) => {
      if (client !== socket) {
        client.write(`${socket.name}: ${message}\n`);
      }// if
    });// for each
  });// closig out socket.on
  socket.on('close', removeClient(socket));
  socket.on('error', () => {
    logger.log(logger.ERROR, socket.name);
    removeClient(socket)();
  });// on error
});// closing out big app.on

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
