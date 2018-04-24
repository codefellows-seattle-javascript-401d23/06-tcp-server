'use strict';

const server = module.exports = {};

const net = require('net');
const logger = require('./logger');
const faker = require('faker');

const app = net.createServer();
let clients = [];

const parseCommand = (message, socket) => {
  if (!message.startsWith('@')) {
    return false;
  }
  const parsedMessage = message.split(' ');
  const command = parsedMessage[0];
  logger.log(logger.INFO, `Parsing a command: ${command}`);

  switch (command) {
    case '@list': {
      const clientNames = clients.map(client => client.name).join('\n');
      socket.write(`${clientNames}\n`);
      break;
    }
    case '@quit': {
      socket.write('Goodbye!\n');
      socket.end();
      break;
    }
    case '@nickname': {
      const newUserName = parsedMessage[1];
      socket.name = newUserName;
      socket.write(`New Username: ${socket.name}\n`);
      break;
    }
    // case '@dm': {
    //   const dmName = parsedMessage[1];
    //   let dm = parsedMessage[2];

    //   clients.forEach(client) => {
    //     if (client.name === dm) {
    //       client.write(`${socket.name}: ${dm.trim()}\n`);
    //     }
    //   };
    //   break;
    // }
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
  logger.log(logger.INFO, 'new socket');
  clients.push(socket);
  socket.write('Welcome to the chat!\n');
  socket.name = faker.internet.userName();
  socket.write(`Your name is ${socket.name}\n`);

  socket.on('data', (data) => {
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
  });
  socket.on('close', removeClient(socket));
  socket.on('error', () => {
    logger.log(logger.ERROR, socket.name);
    removeClient(socket)();
  });
});

server.start = () => {
  if (!process.env.PORT) {
    logger.log(logger.ERROR, 'Missing PORT');
    throw new Error('Missing PORT');
  }
  logger.log(logger.INFO, `Server running on PORT ${process.env.PORT}`);
  return app.listen({ port: process.env.PORT }, () => {});
};
