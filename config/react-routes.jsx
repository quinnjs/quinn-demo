'use strict';

const React = require('react');
const Router = require('react-router');
const Route = Router.Route,
      RouteHandlerMixin = Router.RouteHandlerMixin,
      NotFoundRoute = Router.NotFoundRoute,
      Link = Router.Link;

const About = require('../src/about');

const NotFound = React.createClass({
  render: function() {
    return <div>Not found</div>
  }
});

const DataRouteHandler = React.createClass({
  mixins: [ RouteHandlerMixin ],

  render: function() {
    const route = this.context.getRouteAtDepth(this.getRouteDepth());
    const childData = route ? this.props[route.name || '_def'] || {} : {};
    return this.createChildRouteHandler(childData);
  }
});

const App = React.createClass({
  render: function() {
    return <div>
      <h1>quinn demo</h1>
      <DataRouteHandler {...this.props.app} />
      <h2>Others</h2>
      <ul>
        <li><Link to="about" params={{ id: 'programming' }}>Programming</Link></li>
        <li><Link to="about" params={{ id: 'node' }}>Node</Link></li>
        <li><Link to="about" params={{ id: 'javascript' }}>JavaScript</Link></li>
      </ul>
    </div>;
  }
});

module.exports = (
  <Route name="app" path="/" handler={App}>
    <Route name="board" path="/r/:id" handler={DataRouteHandler}>
      <Route name="about" handler={About} />
    </Route>
    <NotFoundRoute name="not-found" handler={NotFound} />
  </Route>
);
