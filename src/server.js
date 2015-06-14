import { createServer } from 'http';

import quinn from 'quinn';
import cass from 'cass';
import { Provides } from 'nilo';
import connectDatabase from 'knex';

import dbSettings from '../knexfile';

import Todos from './todos/routes';

const db = connectDatabase(dbSettings.development);

const app = cass(Todos);

app.graph.scan({
  @Provides('db')
  getDatabase() { return db; }
});

const server = createServer(quinn(app));

server.listen(8000, function() {
  console.log('Listening.');
});
