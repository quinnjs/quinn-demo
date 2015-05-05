import { json } from 'quinn/respond';
import { GET, POST, PUT } from 'wegweiser';
import __getRawBody from 'raw-body';
import { promisify } from 'Bluebird';
import { mapKeys, snakeCase } from 'lodash';

import db from '../db';

import Todo from './model';

const getRawBody = promisify(__getRawBody);

// TODO: turn this into a proper module
async function readBody(req) {
  const raw = await getRawBody(req, {
    length: req.headers['content-length'],
    limit: '1mb',
    encoding: 'utf8'
  });
  return JSON.parse(raw);
}

function toDbSelector(property) {
  const column = snakeCase(property);
  if (column === property) return property;
  return `${column} as ${property}`;
}

function toRow(obj) {
  return mapKeys(obj, snakeCase);
}

const todoColumns = Todo.getPropertyNames().map(toDbSelector);

class TodoResource {
  query() {
    return db('todos').column(todoColumns);
  }

  @GET('/v1/todos')
  async listTodos(req) {
    const rows = await this.query().select();
    return json({
      todos: rows.map(row => new Todo(row))
    });
  }

  @POST('/v1/todos')
  async createTodo(req) {
    const todo = new Todo(await readBody(req));
    const [ insertId ] = await db('todos').insert(toRow(todo));

    return this.showTodo(req, { id: insertId });
  }

  @GET('/v1/todos/:id')
  async showTodo(req, { id }) {
    const row = await this.query().first().where({ id });
    return row && json(new Todo(row));
  }

  @PUT('/v1/todos/:id')
  async updateTodo(req, { id }) {
    const { label, done } = await readBody(req);

    if (label !== undefined || done !== undefined) {
      const changes = { updated_at: new Date() };

      if (label !== undefined) changes.label = label;
      if (done !== undefined) changes.done = !!done;

      const changedRows = await db('todos').where({ id }).update(changes);
      if (changedRows === 0) return;
    }

    return this.showTodo(req, { id });
  }
}

export default [ TodoResource ];
