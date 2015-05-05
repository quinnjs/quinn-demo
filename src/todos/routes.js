import { json } from 'quinn/respond';
import { GET, POST, PUT } from 'wegweiser';
import __getRawBody from 'raw-body';
import { promisify } from 'Bluebird';

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

class TodoResource {
  @GET('/v1/todos')
  async listTodos(req) {
    const rows = await db('todos').select();
    return json({
      todos: rows.map(Todo.fromRow)
    });
  }

  @POST('/v1/todos')
  async createTodo(req) {
    const todo = new Todo(await readBody(req));
    const [ insertId ] = await db('todos').insert(todo.toRow());

    return this.showTodo(req, { id: insertId });
  }

  @GET('/v1/todos/:id')
  async showTodo(req, { id }) {
    const row = await db('todos').first().where({ id });
    return row && json(Todo.fromRow(row));
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
