import { GET, POST, PUT } from 'wegweiser';
import parsedBody from 'parsed-body/json';
import { mapKeys, snakeCase, pick, isEmpty, filter } from 'lodash';

import db from '../db';

import Todo from './model';

function toDbSelector(property) {
  const column = snakeCase(property);
  if (column === property) return property;
  return `${column} as ${property}`;
}

function toRow(obj) {
  return mapKeys(obj, (v, k) => snakeCase(k));
}

const todoColumns = Todo.getPropertyNames().map(toDbSelector);

class TodoResource {
  query() {
    return db('todos').column(todoColumns);
  }

  @GET('/v1/todos')
  async listTodos(req) {
    const rows = await this.query().select();
    return {
      todos: rows.map(row => new Todo(row))
    };
  }

  @POST('/v1/todos')
  async createTodo(req) {
    const todo = new Todo(await parsedBody(req));
    const [ insertId ] = await db('todos').insert(toRow(todo));

    return this.showTodo(req, { id: insertId });
  }

  @GET('/v1/todos/:id')
  async showTodo(req, { id }) {
    const row = await this.query().first().where({ id });
    return row && new Todo(row);
  }

  @PUT('/v1/todos/:id')
  async updateTodo(req, { id }) {
    const changes = filter(pick(await parsedBody(req), 'label', 'done'));

    if (!isEmpty(changes)) {
      changes.updated_at = new Date();

      const changedRows = await db('todos').where({ id }).update(changes);
      if (changedRows === 0) return;
    }

    return this.showTodo(req, { id });
  }
}

export default [ TodoResource ];
