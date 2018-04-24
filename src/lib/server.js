'use strict';

const net = require('net');
const faker = require('faker');
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

const removeClient = socket => () => {
  users = users.filter(user => user !== socket);
  const activeUsers = users.map(user => user.nickname).join('\n');

  logger.log(logger.INFO, `Removing ${socket.nickname}`);
  logger.log(logger.INFO, `Active Users:\n${activeUsers}\n`);
};

const parseCommand = (message, socket) => {
  if (!message.startsWith('@')) {
    return false;
  }

  const parsedMessage = message.split(' ');
  const command = parsedMessage[0];
  logger.log(logger.INFO, `Parsing command: ${command}`);

  switch (command) {
    case '@list': {
      const totalUsers = users.map(user => user.nickname);
      const activeUsers = totalUsers.join('\n');
      logger.log(logger.INFO, `Active Users: ${activeUsers}`);
      socket.write(`Currently Online (${totalUsers.length}):\n${activeUsers}\n`);
      break;
    }
    case '@quit': {
      removeClient(socket)();
      break;
    }
    case '@nickname': {
      const newName = parsedMessage[1];
      const prevName = socket.nickname;
      socket.nickname = newName;
      logger.log(logger.INFO, `${prevName} has changed their name to ${newName}`);
      socket.write(`Your new name is ${socket.nickname}\n`);
      break;
    }
    case '@dm': {
      const receiver = parsedMessage[1];
      const dm = parsedMessage.slice(2).join(' ');
      logger.log(logger.INFO, `${socket.nickname} has sent a dm to ${receiver}: ${dm}`);
      users.forEach((user) => {
        if (user.nickname === receiver) {
          user.write(`Direct Message from ${socket.nickname}: ${dm}\n`);
        }
      });
      break;
    }
    default:
      socket.write('Invalid command');
      break;
  }
  return true;
};

app.on('connection', (socket) => { 
  logger.log(logger.INFO, 'new socket');
  users.push(socket);
  socket.write('Welcome to the chat.\n');
  socket.nickname = faker.internet.userName();
  socket.id = faker.random.number();
  logger.log(logger.INFO, `Nickname: ${socket.nickname}, id: ${socket.id}`);
  socket.write(`Your name is ${socket.nickname}\n`);

  socket.on('data', (data) => {
    const message = data.toString().trim();
    logger.log(logger.INFO, `${socket.nickname} sending message: ${message}`);

    if (parseCommand(message, socket)) {
      return;
    }

    users.forEach((user) => {
      if (user !== socket) {
        user.write(`${socket.nickname}: ${message}\n`);
      }
    });
  });
  socket.on('close', removeClient(socket));
  socket.on('error', () => {
    logger.log(logger.ERROR, socket.nickname);
    removeClient(socket)();
  });
});
