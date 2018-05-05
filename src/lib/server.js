'use strict';

const net = require('net');
const logger = require('./logger');
const faker = require('faker');
const Client = require('./client')
const Commands = require('./commands')

const server = module.exports = net.createServer();
let clientPool = [];
const PORT = process.env.PORT;

server.on('connection', (socket) => {
  const client = new Client(socket);
  clientPool.push(client);
  client.socket.write(`
       ____     ___     ___
      |_  _|   |  _|   |   |
        ||     | |_    |  _|
        ||     |   |   | | 
       ~~~~~~~~~~~~~~~~~~~~ 
               chat

            Your screen name is ${client.screenName}.
                   [ Available Commands ] \n

      @quit - quits TCP Chat \n
      @list - to show all people connected to this TCP Chat 
      @dm <name> <message> - direct messages another user \n
      @screenName <name> - changes your screenName \n
    \n\n`);

  clientPool.map(c => c.socket.write(`\t${client.screenName} has joined the chat.\n`));

  // whenever the connecting client transmits data (writes something and presses enter), handle it
  socket.on('data', (data) => {
    const message = data.toString().trim();

    if (message.slice(0, 1) === '@') commands.parse(message, client, clientPool);
    else {
      clientPool.filter(c => c.id !== client.id)
        .map(c => c.socket.write(`${client.screenName}: ${message}\n`));
    }
  });

  // when the user disconnects, take user's socket out of the clientPool and inform connected users
  socket.on('close', () => {
    clientPool = clientPool.filter(c => c.id !== client.id);
    clientPool.map(c => c.socket.write(`\t${client.screenName} has left the channel.\n`));
  });

  // if there is an error, log the error
  socket.on('error', (err) => {
    logger.log(logger.ERROR, err);
  });
})
  .listen(PORT, () => logger.log(logger.INFO, `Listening on port ${PORT}`));
