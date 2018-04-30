'use strict';

const net = require('net');
const logger = require('./logger');
const faker = require('faker');

const server = net.createServer();
const PORT = 3000;
let clientPool = [];

const parseCommand = (message, socket) => {
  if (!message.startsWith('@')) {
    return false;
  }

  const parsedMessage = message.split(' ');
  const command = parsedMessage[0];
  logger.log(logger.INFO, `Parsing command: ${command} and parsedMessage: ${parsedMessage}`);

  switch (command) {
    case '@list': {
      const clientNames = clientPool.map(client => client.name).join('\n');
      socket.write(`${clientNames}\n`);
      break;
    }
    case '@quit': {
      clientPool.forEach((client) => {
        if (client !== socket) {
          client.write(`${socket.name} has left the chat.\n`);
        }
      });
      socket.destroy();
      break;
    }
    case '@nickname': {
      clientPool.forEach((client) => {
        const prevName = socket.name;
        const newName = message.match(/^@nickname\s(\w+)/)[1];
        if (client === socket) {
          socket.name = newName;
          client.write(`Your new nickname has been changed to ${newName}\n`);
          if (client !== socket) {
            client.write(`${prevName} has changed their name to ${newName}.\n`);
          }
        } 
      });
      break;
    }
    case '@dm': {
      const toUser = message.match(/^@dm\s(\w+)/)[1];
      const directMessage = message.match(/(^@dm\s\w+\s)(.*)/)[2].trim();
      let dmSent = false;
      clientPool.forEach((client) => {
        logger.log(logger.INFO, `client: ${client}  toUser: ${toUser} directMessage: ${directMessage}`);
        if (client.name === toUser) {
          dmSent = true;
          client.write(`${socket.name}(DM): ${directMessage}\n`);
        }
      });
      if (!dmSent) {
        socket.write('Invalid user name, unable to send direct message.\n');
      }
      break;
    }
    default: 
      socket.write('INVALID COMMAND\n');
      break;
  }
  return true;
};

const removeClient = socket => () => {
  clientPool = clientPool.filter(client => client !== socket);
  logger.log(logger.INFO, `Removing ${socket.name}`);
};

server.on('connection', (socket) => {
  logger.log(logger.INFO, 'new socket');
  clientPool.push(socket);
  socket.write('Welcome to the chat!\n');

  socket.name = faker.internet.userName().replace(/\./g, '_');
  socket.write(`Your name is ${socket.name}\n`);
  //------------------------------------------------------------------------------
  // SOCKET EVENTS
  //------------------------------------------------------------------------------
  socket.on('data', (data) => {
    const message = data.toString().trim();
    // DATA CHECKS
    logger.log(logger.INFO, `Processing a message: ${message}`);
    //---------------------------------------------------------------------------
    // check for commands
    //---------------------------------------------------------------------------
    if (parseCommand(message, socket)) {
      return;
    }
    //--------------------------------------------------------------------------
    clientPool.forEach((client) => {
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

server.listen(PORT, () => {
  logger.log(logger.INFO, `Server is running on port ${PORT}`);
});

server.stop = () => {
  logger.log(logger.INFO, 'Server is offline');
  return server.close(() => {});
};
