'use strict';


module.exports = class ClientC {
  constructor(name)
  this.name = name;
  this.userID = `user~ID~${name}`;
  this.socket = null;
}

//This constructor passes a name, create an ID of user~ID~<name> and connects a null sockect until it is re-assigned