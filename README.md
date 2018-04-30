## Feature Tasks  
For this assignment you will be building a TCP chatroom. Clients should be able to connect using a telnet client nickname them selfs and talk to each other. Clients should also be able to run special commands to quit, list users, reset their nickname, and send direct messages. You may add as many featrues to the chat as you would like. Do not use any third party librarys in your chatroom modules.

##  Documentation  
In your README.md describe the exported values of each module you have defined. Every function description should include it's airty (expected number of paramiters), the expected data for each paramiter (data-type and limitations), and it's behavior (for both valid and invalued use). Feel free to write any additional information in your README.md.

Also write documention for starting your server and connection using telnet. Write documentation for the chat room usage.

This Program has a server module that once it has instaniated the `start` method will allow users to join via the Host Port. The users are prompted to give their name so other members in the chat can recognize them when they send messages to eachother via the server.

Clients should be able to run special commands by sending messages that start with a command name
  * The client should send `@quit` to disconnect
  * The client should send `@list` to list all connectued users
  * The client should send `@nickname <new-name>` to change their nickname
  * The client should send `@dm <to-username> <message>` to  send a message directly to another user by nickname

* Connected clients should be maintained in an in memory collection called the `clientPool`
  * When a socket emits the `close` event, the socket should be removed from the client pool
  * When a socket emits the `error` event, the error should be logged on the server
  * When a socket emits the `data` event, the data should be logged on the server and the commands below should be implemented

## Testing  
No testing required for this lab. Yay!

## Bonus 1pt
Use net.Socket to test your server. Your tests should include the ability to connect, send and recieve messages, and run special commands.
