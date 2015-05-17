import { GET, POST, PUT } from 'wegweiser';
import parsedBody from 'parsed-body/json';
import { pick } from 'lodash';

import Todo from './model';
import Store from './store';

const store = new Store('todos', Todo);

class Todos {
  @GET('/v1/todos')
  async listTodos(req) {
    return {
      todos: await store.list()
    };
  }

  @POST('/v1/todos')
  async createTodo(req) {
    return store.create(await parsedBody(req));
  }

  @GET('/v1/todos/:id')
  showTodo(req, { id }) {
    return store.show(id);
  }

  @PUT('/v1/todos/:id')
  async updateTodo(req, { id }) {
    const changes = pick(await parsedBody(req), 'label', 'done');
    return store.update(id, changes);
  }
}

export default [ Todos ];
