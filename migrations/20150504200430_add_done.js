'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.table('todos', function(t) {
    t.boolean('done').defaultTo(false);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('todos', function(t) {
    t.dropColumn('done');
  });
};
