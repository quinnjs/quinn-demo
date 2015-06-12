import { createServer } from 'http';

import quinn from 'quinn';
import cass from 'cass';
import { Provides } from 'nilo';

import Store from './store';
import Todo from './todos/model';
import Todos from './todos/routes';

const app = cass(Todos);

app.graph.scan({
  @Provides('todoStore')
  getTodoStore() { return new Store('todos', Todo); }
});

const server = createServer(quinn(app));

server.listen(8000, function() {
  console.log('Listening.');
});
