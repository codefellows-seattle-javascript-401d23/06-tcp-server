'use strict';

const net = require('net');
const Client = require('./client');
const commands = require('./commands')
const logger = require('./logger');

const server - module.exports = net.createServer();

const app = net.createServer();
let clientPool = [];
const PORT = process.env.PORT;

server.on('connect to server', (socket) => {
  const client = new Client(socket);
  clientPool.push(client);
  client.socket.write(`Welcome to the chat! Your nickname is ${client.nickname}`);

  clientPool.map(c => c.socket.write(`\t${client.nickname} has joined the chat. \n`));
  socket.on('data', (data => {
    const message = data.toString().trim();

    if(message.slick(0, 1) === '@') commands.parse(message, client, clientPool);
    else {
      clientPool.filter(c => c.id !== client.id)
      .map(c => c.socket.write(`${client.nickname}: ${message}\n`));
    }
  })
})

// * DONE The client should send `@quit` to disconnect
//   * DONE The client should send `@list` to list all connected users
//   * The client should send `@nickname <new-name>` to change their nickname
// * The client sh send `@dm <to-username> <message>` to  send a message directly 2 user by nickname

const removeClient = socket => () => {
  clients = clients.filter(client => client !== socket);
  logger.log(logger.INFO, `Removing ${socket.name}`);
};

const parseCommand = (message, socket) => {
  if (!message.startsWith('@')) {
    return false; 
  }
  const parsedMessage = message.split(' ');
  const command = parsedMessage[0];
  logger.log(logger.INFO, `Parsing a command ${command}`);
};
// O(n) time and O(n) space using .map but we can use forEach
// @dm and default: from lecture
switch (command) {
  case '@list': {
    const clientNames = clients.map(client => client.name).join('\n');
    socket.write(`${clientNames}\n`);
    break;
  }

  case '@quit': {
    
    break;
  }
  case '@nickname': {
    break;
  }
  case '@dm': {
    clients.forEach((client) => {
      if (client.socket == socket) {
        client.socket.write(`${parsedMessage[2]}\n`);
      }
    });
    break;
  }
  default:
    socket.write('Invalid');
    break;
  }
  return true;
}

app.on('connection', (socket) => {
  logger.log(logger.INFO, 'new socket');
  clients.push(socket);
  socket.write('Welcome ot the chat!\n');
  socket.name = faker.internet.userName();
  socket.write('Your name is ${socket.name}\n');

  //socket events
  socket.on('data', (data) => {
    logger.log(logger.INFO, `Processing a message:$ {message}`);
// check for commands
    if (parseCommand(message, socket)) {
      return;
    }
    // check for messages
    clients.forEach((client) => {
      if (client !== socket) {
        client.write(`$${socket.name}: ${message}\n`);
      }
    });
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
