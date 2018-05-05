
'use strict';

const uuid = require('uuid');
const faker = require('faker');

function Client(socket) {
  this.socket = socket;
  this.id = uuid('uuid/v4');
  this.nickname = faker.name.firstName();
}

module.exports = Client;
