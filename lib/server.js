'use strict';

const net = require('net');
const logger = require('./logger');
const faker = require('faker');
const uuid = require('uuid');

//---------------------------------------------------------------------------------------
const app = net.createServer();
let clients = [];
//---------------------------------------------------------------------------------------
const PORT = process.env.PORT;

server.on('connection', (socket) => {
  const client = new Client(socket);
  clients.push(client);

client.socket.write(`Welcome to the Chat ${client}!`)

clients.map(c => c.socket.write(`\t${client.nickname} has joined the chat.\n`));

socket.on('data', (data) => {
  const message = data.toString().trim();

  if (message.slice(0, 1) === '@') commands.parse(message, client, clients);
  else {
    clients.filter(c => c.socket.write(`\t${client.nickname} has left the channel.\n`));
  }
  });


const parseCommand = (message, socket) => {
  if (!message.startsWth('@')) {
    return false;
  }
  // Zachary - The command is going to look like '@<name>'
  const parsedMessage = message.split(' ');
  const command = parsedMessage[0];
  logger.log(logger.INFO, `Parsing a command ${command}`);
  //---------------------------------------------------------------------------------------
  // Zachary - A switch is similar to a series of if statements
  // if (command === '@list') {
  //     // A
  // } else if (command ==='@dm'){
  //
  // } else {
  //     // Z
  // }
  //----------------------------------------------------------------------------

  // make a class Client and then push a new Client into the array every time.  
  // make a new document into the array.
  switch (command) {
    case '@list': {
    // clients.map is O(n) space and O(n) time where n is the amount of clients
      const clientNames = clients.map(client => client.name).join('\n');
      socket.write(`${clientNames}\n`);
      break;
    }
    // Zachary - NEW COMMANDS GO HERE!
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

// Zachary - Socket is the name we give to a specific connection
app.on('connection', (socket) => {
  logger.log(logger.INFO, 'new socket');
  clients.push(socket);   
  socket.write('Welcome to the chat!\n');
  // Zachary - Adding a new property in the socket object
  socket.name = faker.internet.userName();
  socket.write(`Your name is ${socket.name}\n`);
  //---------------------------------------------------------------------------------------
  // SOCKET EVENTS
  //---------------------------------------------------------------------------------------
  socket.on('data', (data) => {
    const message = data.toString().trim();
    // Zachary - DATA CHECKS
    logger.log(logger.INFO, `Processing a message: ${message}`);
    //---------------------------------------------------------------------------------------
    // Check for commands
    //---------------------------------------------------------------------------------------
    if (parseCommand(message, socket)) {
      return;
    }
    //--------------------------------------------------------------------------------------
    // Check for messages
    //---------------------------------------------------------------------------------------
    clients.forEach((client) => {
      if (client !== socket) {
        client.write(`${socket.name}: ${message}\n`);
      } // if
    }); // foreach
  }); // socket.on
  socket.on('close', removeClient(socket));
  socket.on('error', () => {
    logger.log(logger.ERROR, socket.name);
    // Zachary - I'm doing this extra execution because removeClient returns a function
    removeClient(socket)();
  });
});

const server = module.exports = {};

server.start = () => {
  if (!process.env.PORT) {
    logger.log(logger.ERROR, 'missing PORT');
    throw new Error('missing PORT');
  }
  logger.log(logger.INFO, `Sever is up on PORT ${process.env.PORT}`);
  return app.listen({ port: process.env.PORT }, () => {});
};

server.stop = () => {
  logger.log(logger.INFO, 'Server is offline');
  return app.close(() => {});
};
// ------------------------------  

'use strict';

const uuid = require('uuid');
const faker = require('faker');
function Client(socket) {
  this.socket = socket;
  this.id = uuid('uuid/v4');
  this.nickname = faker.name.firstName();
}

module.exports = Client;
