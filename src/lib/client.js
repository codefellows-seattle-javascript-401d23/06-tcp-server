'use strict';

const uuid = require('uuid');
const faker = require('faker');

// * Create a Client constructor that models an individual connection. 
//   * Each client instance should contain at least an `id`, `nickname`, and `socket`.

function Client(socket) {
  this.socket = socket;
  this.id = uuid('uuid/v4');
  this.nickname = faker.name.firstName();
}

module.exports = Client;
