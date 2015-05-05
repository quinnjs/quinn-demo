'use strict';

const settings = {
  client: 'sqlite3',
  connection: {
    filename: './dev.sqlite3'
  }
};

module.exports = { development: settings };
