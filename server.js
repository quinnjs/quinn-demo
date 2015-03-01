'use strict';
require('./config/require-hooks');

const _ = require('lodash');
const React = require('react');
const Router = require('react-router');
const routes = require('./config/react-routes');

const Gofer = require('gofer');
function loadBoardAbout(id) {
  const gofer = new Gofer({
    globalDefaults: {
      baseUrl: 'https://api.reddit.com'
    }
  });
  return new Promise(function(resolve, reject) {
    gofer.fetch(`/r/${id}/about.json`, function(err, data) {
      if (err) reject(err);
      else resolve(data.data);
    });
  });
}

function execQuery(query) {
  // FAKE.
  if (query.from === 'board' && 'about' in query.select) {
    return loadBoardAbout(query.select.id)
      .then(function(about) {
        return {
          id: query.select.id,
          about: _(about)
            .omit('id')
            .pick(Object.keys(query.select.about)) // should be conditional
            .value()
        };
      });
  }
  return Promise.reject(new Error('Unsupported query'));
}

function loadData(routes, params) {
  return Promise.all(
    routes
      .map(function(route) {
        if (route.handler.getQuery) {
          return execQuery(route.handler.getQuery(params));
        } else {
          return Promise.resolve({});
        }
      })
  ).then(function(chunks) {
    // { a: { b: { bData }, additionalAData } };
    return chunks.reduceRight(function(data, chunk, idx) {
      // { [key]: (chunk | data) }
      const key = routes[idx].name || '_def';
      const out = {};
      out[key] = _.merge({}, data, chunk);
      return out;
    }, {});
  });
}

function handler(req, res) {
  function sendError(err) {
    console.error(err.stack);
    res.statusCode = err.statusCode || 500;
    res.end(err.stack);
  }

  const router = Router.create({
    routes: routes,
    location: req.url,
    onError: sendError
  });

  try {
    router.run(function(Handler, ctx) {
      // TODO: handle 404 etc.
      loadData(ctx.routes, ctx.params).then(function(data) {
        const body = React.createElement(Handler, data);
        res.end(React.renderToString(body));
      }).catch(sendError);
    });
  } catch (err) {
    sendError(err);
  }
}

if (module === require.main) {
  const http = require('http');
  const server = http.createServer(handler);
  server.listen(process.env.PORT || 8000, function() {
    console.log(`Listening on ${this.address().port}`);
  });
}
