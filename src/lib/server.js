'use strict';

const net = require('net');
const logger = require('./logger');
const faker = require('faker');
const uuid = require('uuid');

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

class Client {
  constructor(socket) {
    this.id = uuid();
    this.nickname = faker.name.firstName();
    this.socket = socket;
  }
}

const parseCommand = (message, client) => {
  if (!message.startsWith('@')) {
    return false;
  }
  const parsedMessage = message.split(' ');
  const command = parsedMessage[0];
  logger.log(logger.INFO, `Parsing a command ${command}`);

  switch (command) {
    case '@list': {
      const clientNames = clientPool.map(user => user.nickname).join('\n');
      client.socket.write(`${clientNames}\n`);
      break;
    }
    case '@quit': {
      client.socket.end();
      break;
    }
    case '@nickname': {
      client.nickname = parsedMessage[1];//eslint-disable-line
      client.write(`Your new nickname is ${client.nickname}`);
      break;
    }
    case '@dm': {
      const name = parsedMessage[1];
      const receiver = clientPool.filter(user => user.nickname === name)[0];
      const msg = parsedMessage.slice(2).join(' ');
      receiver.socket.write(`${client.nickname}: ${msg}`);
      break;
    }
    default:
      client.write('INVALID COMMAND');
      break;
  }
  return true;
};

const removeClient = client => () => {
  clientPool = clientPool.filter(user => user.id !== client.id);
  logger.log(logger.INFO, `Removing ${client.nickname}`);
};

app.on('connection', (socket) => {
  logger.log(logger.INFO, 'new socket');
  socket.write('Welcome to the chat!\n');
  const client = new Client(socket);
  clientPool.push(client);
  socket.write(`Your id and name is ${client.id} and ${client.nickname}\n`);

  socket.on('data', (data) => {
    const message = data.toString().trim();
    logger.log(logger.INFO, `Processing a message: ${message}`);
    if (parseCommand(message, client)) {
      return;
    }
    clientPool.forEach((user) => {
      user.write(`${client.nickname}: ${message}\n`);
    });
  });
  socket.on('close', removeClient(client));
  socket.on('error', () => {
    logger.log(logger.ERROR, client.nickname);
    removeClient(client)();
  });
}); 
