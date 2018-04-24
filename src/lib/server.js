'use strict';

// Import modules
const net = require('net');
const logger = require('./logger');
const faker = require('faker');

const app = net.createServer();
let clientPool = [];

const parseCommand = (message, socket) => {
  if (!message.startsWith('@')) {
    return false;
  }

  // Command format @'command name'
  const parsedMessage = message.split(' ');
  const command = parsedMessage[0];
  logger.log(logger.INFO, `Parsing incoming command ${command}`);

  // Switch to check the different use cases 
  switch (command) {
    case '@list': {
      const clientNames = clientPool.map(client => client.name).join('\n');
      socket.write(`${clientNames}\n`);
      break;
    }
    case '@quit': {
      // not sure how to exit a putty window aka close on this command...
      removeClient(socket)();
      socket.destory();
      break;
    }
    case '@nickname': {
      const newName = parsedMessage[1];
      socket.nickname = newName; 
      console.log(socket.nickname);
      socket.name = socket.nickname;
      socket.write(`Your nickname is ${socket.nickname}`);
      break;
    }
    case '@dm': {
      console.log(parsedMessage);
      clientPool.forEach((client) => {
        if (client === parsedMessage[1]) {
          let messageValue = []; 
          parsedMessage.forEach((data) => {
            messageValue.push(data);
          })
          messageValue.join(',');
          client.write(`${socket.name}: ${message}\n`);
        }
        socket.write(messageValue);
      });
      break;
    }
    default:
      socket.write('Invalid Command');
      break;
  }
  return true;
};

const removeClient = socket => () => {
  clientPool = clientPool.filter(client => client != socket);
  logger.log(logger.INFO, `Removing ${socket.name} from clientPool array`);
};

// Socket === specific connection to our server
app.on('connection', (socket) => {
  logger.log(logger.INFO, 'new socket');
  clientPool.push(socket);
  socket.write('Welcome to the chat room!\n'); // writes to the individual socket
  socket.name = faker.internet.userName(); // creates new user name property on the socket
  socket.nickname = socket.name;
  socket.write(`Your name is ${socket.name}\n`); 

  socket.on('data', (data) => {
    const message = data.toString().trim();
    // ?data checks
    logger.log(logger.INFO, `Processing the following message ${message}\n`);
    
    if (parseCommand(message, socket)) {
      return;
    }

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

const server = module.exports = {};

server.start = () => {
  if(!process.env.PORT) {
    logger.log(logger.ERROR, 'Missing PORT value');
    throw new Error('missing PORT value');
  }
  logger.log(logger.INFO, `Server is running on PORT: ${process.env.PORT}\n`);
  return app.listen({ port: process.env.PORT }, ()=> {});
};

server.stop = () => {
  logger.log(logger.INFO, 'Server is now offline');
  return app.close(() => {});
};
