'use strict';

const net = require('net');
const logger = require('./logger');
const faker = require('faker');

const app = net.createServer();
let clients = [];

//--------------------------------------------------
// Josh- adding Client Constructor
// class Client {
//   constructor(nickname) {
//     this. = null;
//   }
//--------------------------------------------------

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
    //------------------------------------------------------------
    // insert more commands here!!!
    // @quit to disconnect
    //  @nickname <new-name>
    //  @dm <to-username> <message>
    //------------------------------------------------------------
    default:
      socket.write('INVALID COMMAND');
      break;
  }
  return true;
};

const removeClients = (socket) => () => {
  clients = clients.filter(client => client !== socket);
  logger.log(logger.INFO, `Removing ${socket.name}`);
};

app.on('connection', (socket) => {
  logger.log(logger.INFO, 'new socket');
  clients.push(socket);
  socket.write('Welcome to chat!\n');
  socket.name = faker.internet.userName();
  socket.write(`Your name is ${socket.name}\n`);
//--------------------------------------------------------------
//Josh

//--------------------------------------------------------------    
  
  //--------------------------------------------------------------
  // SOCKET EVENTS
  //--------------------------------------------------------------
  socket.on('data', (data) => {
    const message = data.toString().trim();
    logger.log(logger.INFO, `Processing a message: ${message}`);
//--------------------------------------------------------------
// check for commannds
//--------------------------------------------------------------
    if (parseCommand(message, socket)) {
      return;
    }
//--------------------------------------------------------------
// check for messages
//--------------------------------------------------------------

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

const server = module.exports = {};

server.start = () => {
  if (!process.env.PORT) {
    logger.log(logger.ERROR, 'missing PORT');
    throw new Error('Missing PORT');
  }
  logger.log(logger.INFO, `Server is up on PORT ${process.env.PORT}`);
  return app.listen({ port: process.env.PORT }, () => {});
};

server.stop = () => {
  logger.log(logger.INFO, 'Server is offline');
  return app.close(() => {});
}