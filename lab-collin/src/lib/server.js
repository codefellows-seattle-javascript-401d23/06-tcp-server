'use strict';

const net = require('net');
const logger = require('./logger');
const faker = require('faker');

//-------------------------------------------------------------
const app = net.createServer();
let clients = [];
function Client(socket, id, nickname) {
  this.socket = socket,
  this.id = id,
  this.nickname = nickname;
} 
//-------------------------------------------------------------

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
      clients = clients.filter(client => client.socket !== socket);
      logger.log(logger.INFO, `Removing ${socket.name}`);
      break;
    }
    case '@nickname': {
      clients.forEach((client) => {
        if (client.name === parsedMessage[1]) {
          client.nickname = parsedMessage[1];
        }
      });
      break;
    }
    case '@dm': {
      clients.forEach((client) => {
        if (client.socket === socket) {
          client.socket.write(`${parsedMessage[2]}\n`);
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
  clients = clients.filter(client => client.socket !== socket);
  logger.log(logger.INFO, `Removing ${socket.name}`);
};


app.on('connection', (socket) => {
  logger.log(logger.INFO, 'new socket');
  const newClient = new Client(socket, clients.length, faker.internet.userName());
  clients.push(newClient);
  socket.write('Welcome to the chat!\n');
  socket.write(`Your name is ${newClient.name}\n`);
  //------------------------------------------------------------
  // SOCKET EVENTS
  //------------------------------------------------------------
  socket.on('data', (data) => {
    const message = data.toString().trim();

    logger.log(logger.INFO, `Processing a message: ${message}`);
    //----------------------------------------------------------
    // Check for commands
    //----------------------------------------------------------
    if (parseCommand(message, socket)) {
      return;
    }
    //----------------------------------------------------------
    // Check for messages
    //----------------------------------------------------------
    clients.forEach((client) => {
      if (client.socket !== socket) {
        client.write(`${client.name}: ${message}\n`);
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
