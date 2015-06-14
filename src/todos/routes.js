import { GET, POST, PUT } from 'wegweiser';
import parsedBody from 'parsed-body/json';
import { pick } from 'lodash';
import { Inject } from 'nilo';

import Store from './store';

@Inject()
export default class Todos {
  constructor(store: Store) {
    this.store = store;
  }

  @GET('/v1/todos')
  async listTodos(req) {
    return {
      todos: await this.store.list()
    };
  }

  @POST('/v1/todos')
  async createTodo(req) {
    return this.store.create(await parsedBody(req));
  }

  @GET('/v1/todos/:id')
  showTodo(req, { id }) {
    return this.store.show(id);
  }

  @PUT('/v1/todos/:id')
  async updateTodo(req, { id }) {
    const changes = pick(await parsedBody(req), 'label', 'done');
    return this.store.update(id, changes);
  }
}
