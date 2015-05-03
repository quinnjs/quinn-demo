import { json } from 'quinn/respond';
import { GET, POST } from 'wegweiser';
import __getRawBody from 'raw-body';
import { promisify } from 'Bluebird';

import db from '../db';

import Todo from './model';

const getRawBody = promisify(__getRawBody);

// TODO: turn this into a proper module
function readBody(req) {
  return getRawBody(req, {
    length: req.headers['content-length'],
    limit: '1mb',
    encoding: 'utf8'
  }).then(JSON.parse);
}

class TodoResource {
  @GET('/v1/todos')
  async listTodos(req) {
    return json({
      todos: (await db.select().from('todos')).map(Todo.fromRow)
    });
  }

  @POST('/v1/todos')
  async createTodo(req) {
    const todo = new Todo(await readBody(req));
    const [ insertId ] = await db.insert(todo.toRow()).into('todos');

    return this.showTodo(req, { id: insertId });
  }

  @GET('/v1/todos/:id')
  async showTodo(req, { id }) {
    return db.first().from('todos').where({ id })
      .then(row =>
        (row === undefined) ? undefined : json(Todo.fromRow(row)))
  }
}

export default [ TodoResource ];
