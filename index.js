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
  register: require('hapi-auth-cookie')
}, {
  register: require('bell')
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
    password: 'cookie_encryption_password_secure',
    clientId: '',
    clientSecret: '',
    isSecure: false
  });

    //Creating routes
    server.route({
        method: 'GET',
        path: '/auth/twitter',
        config: {
          auth: 'twitter',
          handler: function (request, reply) {

            const profile = request.auth.credentials.profile;

            request.cookieAuth.set({
              twitterId: profile.id,
              username: profile.username,
              displayName: profile.displayName
            });

            return reply.redirect('/');
          }
        }
    });

    server.route({
        method: 'GET',
        path: '/',
        handler: function (request, reply) {
            const html = `<h1>Hello ${request.auth.credentials.displayName}!</h1>
                          <a href="/logout">Logout</a>`;
            return reply(html);
        },
        config: {
            auth: 'session'
        }
    });

    server.route({
        method: 'GET',
        path: '/profile',
        handler: function (request, reply) {

          return reply(request.auth.credentials);
        },
        config: {
            auth: 'session'
        }
    });

    // logout
    server.route({
      method: 'GET',
      path: '/logout',
      handler: (request, reply) => {

        request.cookieAuth.clear();

        return reply('You are logged out!');
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
