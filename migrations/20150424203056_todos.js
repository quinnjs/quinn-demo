'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('todos', function(t) {
    t.increments('id');
    t.text('label');
    t.timestamps();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('todos');
};
