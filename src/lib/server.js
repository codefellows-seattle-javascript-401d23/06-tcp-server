'use strict';

const net = require('net');
const logger = require('./logger');

const app = net.createServer();
let clients = [];

const parseCommand = (message, socket) => {
  if (!message.startsWith('@')) {
    return false;
  }
  const parsedMessage = message.split(' ');
  const command = parsedMessage[0];
  logger.log(logger.INFO, `Parsing a command ${command}`);
  switch (command) {
    case '@list': {
      const clientNames = clients.map(client => client.name).join('\n');
      socket.write(`${clientNames}\n`);
      break;
    }
    case '@quit': {
      socket.end();
      break;
    }
    case '@nickname': {
      socket.name = parsedMessage[1];
      socket.write(`Your nickname was changed to : ${socket.name}\n`);
      break;
    }
    case '@dm': {
      clients.forEach((client) => {
        if (client.name === parsedMessage[1]) {
          client.write(`${socket.name}: ${parsedMessage.slice(2).join(' ')}\n`);
        }
      });
      break;
    }
    default:
      socket.write('INVALID COMMAND');
      break;
  }
  return true;
};

const removeClient = socket => () => {
  clients = clients.filter(client => client !== socket);
  logger.log(logger.INFO, `Removing ${socket.name}`);
};

app.on('connection', (socket) => {
  logger.log(logger.INFO, 'New socket made');
  clients.push(socket);
  socket.write('Welcome to the chat!\n');
  socket.write('Enter UserName\n');
  socket.on('data', (data) => {
    if (!socket.name) {
      socket.name = data.toString().trim();
      socket.write(`Hello ${socket.name}, welcome to the chat!\n`);
      logger.log(logger.INFO, `New User created, ${socket.name}`);
    } else {
      const message = data.toString().trim();
      logger.log(logger.INFO, `Processing a message: ${message}`);
      if (parseCommand(message, socket)) {
        return;
      }
      clients.forEach((client) => {          
        if (client !== socket) {
          client.write(`${socket.name}: ${message}\n`);
        }
      });
    }
  });
  socket.on('close', removeClient(socket));
  socket.on('error', () => {
    logger.log(logger.ERROR, socket.name);
    removeClient(socket)();
  });
});


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
