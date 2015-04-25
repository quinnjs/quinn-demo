import { chain, property, extend, merge } from 'lodash';
import { createElement, renderToString } from 'react';
import Router from 'react-router';
import routes from './config/react-routes';
import Bluebird from 'bluebird';

import Gofer from 'gofer';
import Hub from 'gofer/hub';

const hub = extend(new Hub(), { Promise: Bluebird });

const reddit = new Gofer({
  globalDefaults: {
    baseUrl: 'https://api.reddit.com'
  }
}, hub);

function loadBoardAbout(id) {
  return reddit.fetch(`/r/${id}/about.json`)
    .then(property('data'));
}

function execQuery(query) {
  // FAKE.
  if (query.from === 'board' && 'about' in query.select) {
    return loadBoardAbout(query.select.id)
      .then(function(about) {
        return {
          id: query.select.id,
          about: chain(about)
            .omit('id')
            .pick(Object.keys(query.select.about)) // should be conditional
            .value()
        };
      });
  }
  return Bluebird.reject(new Error('Unsupported query'));
}

function loadData(routes, params) {
  return Bluebird.map(routes, function(route) {
    if (route.handler.getQuery) {
      return execQuery(route.handler.getQuery(params));
    } else {
      return Bluebird.resolve({});
    }
  }).then(function(chunks) {
    // { a: { b: { bData }, additionalAData } };
    return chunks.reduceRight(function(data, chunk, idx) {
      // { [key]: (chunk | data) }
      const key = routes[idx].name || '_def';
      const out = {};
      out[key] = merge({}, data, chunk);
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
        const body = createElement(Handler, data);
        res.end(renderToString(body));
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
