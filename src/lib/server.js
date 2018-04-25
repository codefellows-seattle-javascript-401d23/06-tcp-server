'use strict';

const net = require('net');
const logger = require('./logger');

const app = net.createServer();
const server = module.exports = {};

server.start = () => {
  if (!process.env.PORT) {
    logger.log(logger.ERROR, 'missing PORT');
    throw new Error('missing PORT');
  }
  logger.log(logger.INFO, `Server is up on PORT ${process.env.PORT}`);
  return app.listen({ port: process.env.PORT }, () => {});
};

server.stop = () => {
  logger.log(logger.INFO, 'Server is offline');
  return app.close(() => {});
};

let clientPool = [];

module.exports = class Client {
  constructor(id, nickname, socket) {
    this.id = id;
    this.nickname = nickname;
    this.socket = socket;
  }
};

const parseCommand = (message, socket) => {
  if (!message.startsWith('@')) {
    return false;
  }
  const parsedMessage = message.split(' ');
  const command = parsedMessage[0];
  logger.log(logger.INFO, `Parsing a command ${command}`);

  switch (command) {
    case '@list': {
      const clientNames = clientPool.map(client => client.name).join('\n');
      socket.write(`${clientNames}\n`);
      break;
    }
    case '@quit': {
      server.stop();
      app.close();
      break;
    }
    case '@nickname <new-name>': {
      socket.nickname = newName;
      socket.write(`Your new nickname is ${socket.nickname}`);
      break;
    }
    case '@dm <to-username> <message>': {
      socket.write(`${socket.nickname}: ${message}`);
      break;
    }
    default:
      socket.write('INVALID COMMAND');
      break;
  }
  return true;
};

const removeClient = socket => () => {
  clientPool = clientPool.filter(client => client !== socket);
  logger.log(logger.INFO, `Removing ${socket.nickname}`);
};

app.on('connection', (socket) => {
  logger.log(logger.INFO, 'new socket');
  clientPool.push(socket);
  socket.write('Welcome to the chat!\n');
  socket.id = this.id;
  socket.nickname = this.nickname;
  socket.socket = this.socket;
  socket.write(`Your id and name is ${socket.id} and ${socket.nickname}\n`);

  socket.on('data', (data) => {
    const message = data.toString().trim();
    logger.log(logger.INFO, `Processing a message: ${message}`);
    if (parseCommand(message, socket)) {
      return;
    }
    clientPool.forEach((client) => {
      if (client !== socket) {
        client.write(`${socket.nickname}: ${message}\n`);
      }
    });
  });
  socket.on('close', removeClient(socket));
  socket.on('error', () => {
    logger.log(logger.ERROR, socket.nickname);
    removeClient(socket)();
  });
}); 
