'use strict';

const net = require('net');
const logger = require('./logger');
const faker = require('faker');

const app = net.createServer();
let clients = [];

const parseCommand = (message, socket) => {
  if (!message.startsWith('@')) {
    return false;
  }
  // The command is going to look like @nameOfCommand
  const parseMessage = message.split(' ');
  const command = parseMessage[0];
  logger.log(logger.INFO, `Parsing a command: ${command}`);
  // faster than a chain of if/else statement
  switch (command) {
    case '@list': {
      // clients.mpa is O(n) space and O(n) time where n is the amount of clients
      const clientNames = clients.map(client => client.name).join('\n');
      socket.write(`${clientNames}\n`);
      break;
    }
    // case '@dm': {
    //   const clientNames = filter(client => client !== socket);
    //   break;
    }
    // This will always be at the end, its a "catch-all"    
    default: 
      socket.write('INVALID COMMAND');
  }
  return true;
};

const removeClient = socket => () => {
  clients = clients.filter(client => client !== socket);
  logger.log(logger.INFO, `Removing ${socket.name}`)
};

app.on('connection', (socket) => {
  logger.log(logger.INFO, 'new socket');
  clients.push(socket);
  socket.write('Welcome to the chat!\n');

  // adding new property to socket object
  socket.name = faker.internet.userName();
  socket.write(`Your name is ${socket.name}\n`);
  // socket events
  socket.on('data', (data) => { // this is only an addative
    console.log(data);
    const message = data.toString().trim();
    // before using info double check data
    logger.log(logger.INFO, `proccessing message: ${message}`);
    if (parseCommand(message, socket)) {
      return;
    }

    clients.forEach((client) => {
      if (client !== socket) {
        client.write(`${socket.name}: ${message}\n`);
      } // if
    }); // forEach
  }); // socket.on
  socket.on('close', removeClient(socket));
  socket.on('error', () => {
    logger.log(logger.ERROR, socket.name);
    // Doing this extra execution bc removeClientClient returns a function
    removeClient(socket);
  });
}); // app.on

const server = module.exports = {};

server.start = () => {
  if (!process.env.PORT) {
    logger.log(logger.ERROR, 'missing PORT');
    throw new Error('missing PORT'); // stops the application
  }
  logger.log(logger.INFO, `Server is up on port ${process.env.PORT}`);
  return app.listen({ port: process.env.PORT }, () => {}); // must use object to set PORT
};

server.stop = () => {
  logger.log(logger.INFO, 'Server is Stopping')
}
