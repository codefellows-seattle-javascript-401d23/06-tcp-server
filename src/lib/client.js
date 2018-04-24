'use strict';


module.exports = class ClientC {
  constructor(name)
  this.name = name;
  this.userID = `userID${this.name}`;
  this.socket = null;
}