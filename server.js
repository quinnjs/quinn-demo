import { createServer } from 'http';

import createApp from 'quinn';
import createRouter from 'wegweiser';
import cass from 'cass'

import todoRoutes from './src/todos/routes';

const router = createRouter(...todoRoutes);

function errorLogger(handler) {
  return async req => {
    try {
      return await handler(req);
    } catch (err) {
      console.error(err.stack);
      return Promise.reject(err);
    }
  };
}

const app = createApp(cass(errorLogger(router)));
const server = createServer(app);

server.listen(8000, function() {
  console.log('Listening.');
});
