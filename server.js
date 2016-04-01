'use strict';

const Hapi = require('hapi');
const Good = require('good');

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
    host: 'localhost',
    port: 8000
});

// Database variables
const username = process.env.USER;
const password = process.env.PASSWORD;
const database = process.env.DATABASE;

// MongoDB connection
const dbOpts = {
    'url' : 'mongodb://' + username + ':' + password + '@ds011810.mlab.com:11810/' + database,
    'settings': {
        'db': {
            'native_parser': false
        }
    }
};

server.register({
    register: require('hapi-mongodb'),
    options: dbOpts
}, (err) => {

    if (err) {
        console.error(err);
        throw err;
    }
});

// Fetch a questions
server.route( {
    'method': 'GET',
    'path': '/allquestions',
    config: {
        handler: (request, reply) => {

            const db = request.server.plugins['hapi-mongodb'].db;
            reply(db.collection('questions').find({}).toArray());	//filter only with ID + TITLE
        },
        cors: true
    }
});


// Default route
server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {

        reply('Hello, world!');
    }
});



// Static pages and content
server.register(require('inert'), (err) => {

    if (err) {
        throw err;
    }

    server.route({
        method: 'GET',
        path: '/say',
        handler: function (request, reply) {

            reply.file('./public/hello.html');
        }
    });
});

// Logging
server.register({
    register: Good,
    options: {
        reporters: [{
            reporter: require('good-console'),
            events: {
                response: '*',
                log: '*'
            }
        }]
    }
}, (err) => {

    if (err) {
        throw err; // something bad happened loading the plugin
    }

    server.start((err) => {

        if (err) {
            throw err;
        }
        server.log('info', 'Server running at: ' + server.info.uri);
    });
});
