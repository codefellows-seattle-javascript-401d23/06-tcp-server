# 06: TCP SERVER
**Author**: David Stoll
**Version**: 1.0.0 
## Overview
For this assignment you will be building a TCP chatroom. Clients should be able to connect using a telnet client nickname them selfs and talk to each other. Clients should also be able to run special commands to quit, list users, reset their nickname, and send direct messages. You may add as many features to the chat as you would like. Do not use any third party libraries in your chatroom modules.
## Documentation
- @list - lists all active members of chat room
- @quit - client uses to remove themselves from chat room
- @dm - sends a direct message to a specified person in chat room
- @nickname - allows client to change their username

## Architecture
Built in VSCode with JavaScript, node.js, eslinter, & winston.