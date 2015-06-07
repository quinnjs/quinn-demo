import { createServer } from 'http';

import createApp from 'quinn';
import createRouter from 'wegweiser';
import cass from 'cass';
import Bluebird from 'bluebird';

import Todos from './todos/routes';

const router = createRouter(Todos);

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
