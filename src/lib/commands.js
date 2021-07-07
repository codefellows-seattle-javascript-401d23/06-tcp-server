
'use strict';

const commands = module.exports = {};

commands.parse = (message, client, clientPool) => {
  const messageArray = message.split(' '); 
  const command = messageArray[0]; 
  const name = messageArray[1]; 
  const msg = messageArray.slice(2).join(' '); 

  switch (command) { 
    case '@nickname': {
      const temp = client.nickname;
      client.nickname = name;
      clientPool.map(c => c.socket.write(`\t${temp} has changed their nickname to ${name}.\n`));
      break;
    }

    case '@quit': 
      client.socket.write(`\tSee you later, ${client.nickname}!\n`);
      client.socket.end();
      break;

    case '@list':
      client.socket.write(`\tUsers connected: ${clientPool.map(c => c.nickname).join(', ')}\n`);
      break;

    case '@dm': {
      const personToDM = clientPool.filter(c => c.nickname === name)[0];
      personToDM.socket.write(`[DM] ${client.nickname}: ${msg}`);
      break;
    }

    default:
      client.socket.write('\tYou have entered an invalid command.\n');
  }
};
