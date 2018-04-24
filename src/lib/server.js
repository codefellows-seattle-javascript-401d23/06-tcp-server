const net = require('net');
const logger = require('./logger');
const faker = require('faker');

const app = net.createServer();
let clientPool = [];

const removeClient = socket => () => {
  clientPool = clientPool.filter(client => client !== socket);
  logger.log(logger.INFO, `Removing ${socket.nickname}`);
};

const server = module.exports = {};

const parseCommand = (message, socket) => {
  if (!message.startsWith('@')) { return false; }
  const parsedMessage = message.split(' ');
  const command = parsedMessage[0];
  logger.log(logger.INFO, `Parsing a command ${command}`);
  switch (command) {
    case '@list': {
      const clientNames = clientPool.map(client => client.nickname).join('\n');
      socket.write(`${clientNames}\n`);
      break;
    }
    case '@quit': {
      removeClient(socket)();
      socket.destroy();
      break;
    }
    case '@nickname': {
      const newNickname = parsedMessage[1];
      socket.nickname = newNickname;
      socket.write(`New nickname: ${socket.nickname}\n`);
      break;
    }
    case '@dm': {
      const recipientName = parsedMessage[1];
      let directMessage = parsedMessage[2];
      for (let i = 3; i < parsedMessage.length; i++) {
        directMessage += ` ${parsedMessage[i]}`;
      }
      clientPool.forEach((client) => {
        if (client.nickname === recipientName) {
          client.write(`${socket.nickname}: ${directMessage.trim()}\n`);
        }
      });
      break;
    }
    default:
      socket.write('INVALID COMMAND. Valid commands:\n@list: Lists all connected' +
        ' users\n@nickname: Set or reset your nickname\n@dm: Direct message a user\n@quit: Quit' +
        ' session\n');
  }
  return true;
};

app.on('connection', (socket) => {
  logger.log(logger.INFO, 'NEW SOCKET');
  clientPool.push(socket);
  socket.write('Welcome to the chat room\n');
  socket.id = faker.internet.userName();
  socket.nickname = socket.id;
  socket.write(`Your name is ${socket.id}. Use command '@nickname' to set nickname\n`);
  socket.on('data', (data) => {
    const message = data.toString().trim();
    logger.log(logger.INFO, `Processing message from ${socket.nickname}: ${message}`);
    if (parseCommand(message, socket)) { return; }
    clientPool.forEach((client) => {
      if (client !== socket) {
        client.write(`${socket.nickname}: ${message}\n`);
      }
    });
  });
  socket.on('close', removeClient(socket));
  socket.on('error', () => {
    logger.log(logger.ERROR, socket.nickname);
    removeClient(socket)();
  });
});

server.start = () => {
  if (!process.env.PORT) {
    logger.log(logger.ERROR, 'MISSING PORT');
    throw new Error('MISSING PORT');
  }
  logger.log(logger.INFO, `Server started on PORT ${process.env.PORT}`);
  return app.listen({ port: process.env.PORT }, () => {});
};

server.stop = () => {
  logger.log(logger.INFO, 'SERVER IS OFFLINE');
  return app.close(() => {});
};
