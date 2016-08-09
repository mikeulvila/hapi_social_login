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
}, {
  register: require('bell')
}, {
  register: require('hapi-auth-cookie')
}], (err) => {

  if (err) {
    throw err;
  }

  // create cookie scheme from hapi-auth-cookie named session
  server.auth.strategy('session', 'cookie', {
    password: 'eGenCG7wGdzeiKISE7Ftt2A7z623G1I1',
    redirectTo: '/auth/twitter',
    isSecure: false  // set to false for development
  });

  server.start(err => {

    if (err) {
      throw err;
    }

    console.log('Server running at: ', server.info.uri);
  });
});
