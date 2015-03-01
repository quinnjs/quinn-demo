'use strict';
const React = require('react');

const About = React.createClass({
  statics: {
    getQuery: function(props) {
      return {
        from: 'board',
        select: {
          id: props.id,
          about: {
            title: undefined
          }
        }
      };
    }
  },

  render: function() {
    // this.props only has { id, about: { title } }
    return <div>
      <h2>{this.props.about.title}</h2>
    </div>;
  }
});
module.exports = About;
