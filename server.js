'use strict';

function handler(req, res) {
  res.end('ok');
}

if (module === require.main) {
  const http = require('http');
  const server = http.createServer(handler);
  server.listen(process.env.PORT || 8000);
}
