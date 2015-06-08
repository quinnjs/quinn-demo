import { createServer } from 'http';

import createApp from 'quinn';
import createRouter from 'wegweiser';
import cass from 'cass';
import Bluebird from 'bluebird';
import { createGraph, Provides } from 'nilo';

import Store from './store';
import Todo from './todos/model';
import Todos from './todos/routes';

const scope = createGraph({
  @Provides('todoStore')
  getTodoStore() { return new Store('todos', Todo); }
}).createScope();

const router = createRouter(scope.construct(Todos));

function errorLogger(handler) {
  return async req => {
    try {
      return await Bluebird.resolve(handler(req));
    } catch (err) {
      console.error(err.stack);
      return Bluebird.reject(err);
    }
  };
}

const app = createApp(cass(errorLogger(router)));
const server = createServer(app);

server.listen(8000, function() {
  console.log('Listening.');
});
