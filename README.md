# Documentation

This app creates a simple chat room where users can connect to localhost 3000 and chat with other users connected to that port.

## Exported Functions

`server.start()` : This function starts the server at the designated port and listens for changes. <br/>
    - Arity: 0 <br/>
    - Data type: N/A

`server.stop()` : This function stops the server.
    - Arity: 0 <br/>
    - Data type: N/A

`app.on('connection', function)` : This function will trigger when a user connects with the port. It will return the user's generated randomized name
    - Arity: 1 <br/>
    - Data type: Object

`removeClient(client)` : This function is triggered when a user disconnects from the server or if there is a server error. This will remove the user from the active users list.
    - Arity: 1 <br/>
    - Data type: Object

`parseCommand(message, client)` : This function will listen for different commands and execute them for the targeted clients. Supported commands include: <br/>
    - Arity: 2 <br/>
    - Data type: String, Object <br/>
    
 ### Supported user commands:
   - `nc localhost 3000` : Connects to chat room
   - `@nickname <name>` : Will set a user's nickname
   - `@dm <username> <message>` : Will send a direct message to the specified user
   - `@list` : Will print out a list of all connected users 
   - `@quit` : Will disconnect the user from the server
   - `<message>` : Will send message to all connected users
    
