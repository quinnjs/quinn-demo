'use strict';
const React = require('react');
const marked = require('marked');

const Marked = React.createClass({
  render: function() {
    const html = marked(this.props.source);
    return <div dangerouslySetInnerHTML={{__html: html }} />;
  }
});

const About = React.createClass({
  statics: {
    getQuery: function(props) {
      return {
        from: 'board',
        select: {
          id: props.id,
          about: {
            title: undefined,
            description: undefined
          }
        }
      };
    }
  },

  render: function() {
    // this.props only has { id, about: { title, description } }
    return <div>
      <h2>{this.props.about.title}</h2>
      <Marked source={this.props.about.description} />
    </div>;
  }
});
module.exports = About;
