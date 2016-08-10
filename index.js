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

  // cookie scheme from hapi-auth-cookie named session
  server.auth.strategy('session', 'cookie', {
    password: 'eGenCG7wGdzeiKISE7Ftt2A7z623G1I1',
    redirectTo: '/auth/twitter',
    isSecure: false  // set to false for development
  });

  // bell twitter scheme for auth
  server.auth.strategy('twitter', 'bell', {
    provider: 'twitter',
    password: 'eGenCG7wGdzeiKISE7Ftt2A7z623G1I1',
    clientId: '',
    clientSecret: '',
    isSecure: false
  });

  // create routes
  server.route({
    method: 'GET',
    path: '/',
    handler: function(request, reply) {

      return reply(`Hello ${request.auth.credentials.profile.displayName}!`);
    },
    config: {
      auth: 'session'
    }
  });

  // use bell's twitter strategy for auth and set cookie
  server.route({
    method: 'GET',
    path: '/auth/twitter',
    handler: function (request, reply) {

      request.cookieAuth.set(request.auth.credentials);

      return reply.redirect('/');
    },
    config: {
      auth: 'twitter'
    }
  });

  // start server
  server.start(err => {

    if (err) {
      throw err;
    }

    console.log('Server running at: ', server.info.uri);
  });
});
