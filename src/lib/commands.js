'use strict';

const commands = module.exports = {};

commands.parse = (message, client, clientPool) => {
  const messageArray = message.split(' ');
  const command = messageArray[0];
  const name = messageArray[1];
  const msg = messageArray.slice(2).join(' ');

  switch (command) {
    case '@screenName': {
      const temp = client.screenName;
      client.screenName = name;
      clientPool.map(c => c.socket.write(`${temp} has changed their screenName to ${name}.\n`));
      break;
    }

    case '@quit':
      client.socket.write('Good Bye!\n');
      client.socket.end();
      break;

    case '@list':
      client.socket.write(`Current Chatters: ${clientPool.map(c => c.screenName).join(', ')}\n`);
      break;

    case '@dm': {
      const personToDM = clientPool.filter(c => c.screenName === name)[0];
      personToDM.socket.write(`[DM] ${client.screenName}: ${msg}\n`);
      break;
    }

    default:
      client.socket.write('That was an invalid command!\n');
  }
};