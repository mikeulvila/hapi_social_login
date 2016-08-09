'use strict';

const Hapi = require('hapi');
const Boom = require('boom');

// create server connection
const server = new Hapi.Server();
server.connection({
  port: 3000
});

// Register plugins and start server
server.register([{
  register: require('good'),
  options: {
    reporters: {
      console: [{
        module: 'good-squeeze',
        name: 'Squeeze',
        args: [{
          log: '*',
          response: '*'
        }]
      }, {
        module: 'good-console'
      }, 'stdout']
    }
  }
}], (err) => {

  if (err) {
    throw err;
  }

  server.start(err => {

    if (err) {
      throw err;
    }

    console.log('Server running at: ', server.info.uri);
  });
});
