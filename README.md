## Lab-06: TCP Chat Server

**Author**: Daniel Shelton
**Version**: 1.0.2

## Overview
This application establishes a TCP chat server for users to communicate over, each new user is assigned a randomly generated "nickname" which acts as that user's display name. 

## Architecture
The main entry point for this application is the server.js, in addition to the server file, there is also a logger.js file for logging console messages. 

## Data Structure of Server.js
- This file requires the net and faker npm packages as well as linking to the logger.js file.
- PORT is set to 3000.
- Each new connection is added to the clientPool.
- Messages are parsed and messages beginning with a "@" symbol is identified as a command, messages not indicated as commands are posted to each active user's session.
- Command List:
  1. '@list': Displays a list of all users in the clientPool.
  2. '@quit': Ends the session, all other active users are notified of the disconnection.
  3. '@nickname <name>': Reassigns nickname.
  4. '@dm <to-user> <message>': Sends a direct message to a specified active user, if the username entered was invalid, user is notified of the invalid entry.

## Change Log

04-24-2018 8:59pm - Scaffolding/setup complete.
04-29-2018 8:24pm - All tasks complete, TCP server is fully functioning.