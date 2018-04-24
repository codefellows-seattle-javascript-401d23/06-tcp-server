'use strict';

const net = require('net');
const logger = require('./logger');
const faker = require('faker');

const server = module.exports = {};

//---------------------------------------------------------------------
const app = net.createServer();
let clients = [];
//---------------------------------------------------------------------

const parseCommand = (message, socket) => {
    if (!message.startsWith('@')) {
        return false;
    }
    // The command is going to look like '@<name>'
    const parsedMessage = message.split(' ');
    const command = parsedMessage[0];
    logger.log(logger.INFO, `Parsing a command ${command}`);

    
    switch(command) {
        case '@list': {
            //clients.map is 0(n) space and O(n) time where n is the amount of clients.
            const clientNames = clients.map(client => client.name).join('\n');
            socket.write(`${clientNames}\n`);
            break;
        }
        //TODO NEW COMMANDS GO HERE!
        default: 
        socket.write('INVALID COMMAND');
        break;
    };
    return true;
};

const removeClient = socket => () => {
    clients = clients.filter(client => client !== socket);
    logger.log(logger.INFO, `Removing ${socket.name}`);
};

// Socket is the name we give to a specific connection
app.on('connection', (socket) => {
    logger.log(logger.INFO, 'new socket');
    clients.push(socket);
    socket.write('Welcome to the chat!\n');

    //adding a new property to the socket obj
    socket.name = faker.internet.username();
    socket.write(`Your name is ${socket.name}\n`);
    //------------------------------------------------------------------------------
    // SOCKET EVENTS
    //------------------------------------------------------------------------------
    socket.on('data', (data) => {
        const message = data.toString().trim();
        // DATA CHECKS
        logger.log(logger.INFO, `Procesing a message: ${message}`);
        //---------------------------------------------------------------------------
        //check for commands
        //---------------------------------------------------------------------------
        if (parseCommand(message, socket)) {
            return;
        }
        //--------------------------------------------------------------------------
        clients.forEach((client) => {
            if(client !== socket) {
                client.write(`${socket.name}: ${message}\n`);
            } // if
        }); //foreach
    }); //socket.on
    socket.on('close', removeClient(socket));
    socket.on('error', () => {
        logger.log(logger.ERROR, socket.name);
        //I'm doing this extra execution because removeClient returns a function
        removeClient(socket)();
    });
});

server.start = () => {
    if(!process.env.PORT) {
        logger.log(logger.ERROR, 'missing PORT');
        throw new Error('missing PORT');
    }
    logger.log(logger.INFO, `Server is up on port ${process.env.PORT}`);
    return app.listen({port: process.env.PORT}, () => {});
};

server.stop = () => {
    logger.log(logger.INFO, 'Server is offline');
    return app.close(() => {});
};
