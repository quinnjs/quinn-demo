import { createServer } from 'http';

import createApp from 'quinn';
import createRouter from 'wegweiser';

import todoRoutes from './src/todos/routes';

const router = createRouter(...todoRoutes);

function errorLogger(handler) {
  return function withErrorLogger(req) {
    return new Promise(resolve => resolve(handler(req)))
      .then(null, function(err) {
        console.error(err.stack);
        return Promise.reject(err);
      });
  };
}

const app = createApp(errorLogger(router));
const server = createServer(app);

server.listen(8000, function() {
  console.log('Listening.');
});
