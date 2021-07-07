'use strict';

const net = require('net');
const Client = require('./client');
const commands = require('./commands');
const logger = require('./logger');

const server = module.exports = net.createServer();
let clientPool = [];
const PORT = process.env.PORT; // eslint-disable-line

server.on('connect to server', (socket) => {
  const client = new Client(socket);
  clientPool.push(client);
  client.socket.write(`Welcome to the chat! Your nickname is ${client.nickname}.
  [ Here are the commands available to you. ]
  @list = lists connected users
  @quit - quits the chat
  @nickname <name> -- changes your nickname
  @dm <name> <message> -- direct messages another user\n\n`);

  clientPool.map(c => c.socket.write(`\t${client.nickname} has joined the chat. \n`));

  socket.on('data', (data) => {
    const message = data.toString().trim();

    if (message.slice(0, 1) === '@') commands.parse(message, client, clientPool);
    else {
      clientPool.filter(c => c.id !== client.id)
        .map(c => c.socket.write(`${client.nickname}: ${message}\n`));
    }
  });

  socket.on('close the chat', () => {
    clientPool = clientPool.filter(c => c.id !== client.id);
    clientPool.map(c => c.socket.write(`\t${client.nickname} has left the channel.\n`));
  });
  socket.on('error', (err) => {
    logger.log(logger.ERROR, err);
  });
})
  .listen(PORT, () => logger.log(logger.INFO, `Listening on port ${PORT}`));
