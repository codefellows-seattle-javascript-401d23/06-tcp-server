'use strict';

const net = require('net');
const logger = require('./logger');
const faker = require('faker');

//-----------------------
const app = net.createServer();
let clients = [];
//-----------------------

const parseCommand = (message, socket) => {
  if (!message.startsWith('@')) {
    return false;
  }
  // Mike - command will start with '@name'
  const parsedMessage = message.split(' ');
  const command = parsedMessage[0];
  logger.log(logger.INFO, 'Parsing a command &{command}');
  
  switch (command) {
    case '@list': {
      const clientNames = clients.map(client => client.name).join('\n');
      socket.write(`${clientNames}\n`);
      break;
    }
    // This is where new commands should go...
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
  // Mike - here is where to add new properties to the socket object
  socket.name = faker.internet.userName();
  socket.write(`Your name is ${socket.name}\n`);
  //----------------------
  // socket events here...
  //----------------------
  socket.on('data', (data) => {
    const message = data.toString().trim();
    // Data checks here
    logger.log(logger.INFO, `Processing a message: ${message}`);
    // ---------------
    // checking for commands
    // ---------------
    if (parseCommand(message, socket)) {
      return;
    }
    //-----------------
    // Checking for messages
    //-----------------
    clients.forEach((client) => {
      if (client !== socket) {
        client.write(`${socket.name}: ${message}\n`);
      } // if
    }); // forEach
  }); // socket.on
  socket.on('close', removeClient(socket));
  socket.on('error', () => {
    logger.log(logger.ERROR, socket.name);
    // removeClient returns a function...
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
