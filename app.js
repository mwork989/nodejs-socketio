import express from 'express';
import path from 'path';
import http from 'http';

const LocalStorage = require('node-localstorage').LocalStorage;
let localStorage = new LocalStorage('./scratch');
const iplocate = require("node-iplocate");
const publicIp = require('public-ip');
let io = require('socket.io');
let app = express();


// Add configure for ui and port
app.configure(() => {
    app.set('port', process.env.PORT || 3000);
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', () => {
    app.use(express.errorHandler());
});

// Set up express
let server = http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});

// Set up socket.io
io = require('socket.io').listen(server);


// Handle socket traffic
io.sockets.on('connection',  (socket) => {

    var list = io.sockets.sockets;
    var users = Object.keys(list);
   


    // Set the nickname property for a given client
    socket.on('nick', (nick) => {
        socket.set('nickname', nick);
        socket.emit('userlist', users);
    });

   

    // Relay chat data to all clients
    socket.on('chat', (data) => {
        socket.get('nickname', (err, nick) => {
            publicIp.v4().then(ip => {
                iplocate(ip).then(function(results) {
                    let respo = JSON.stringify(results.city, null, 2)
                    localStorage.setItem('userlocal',respo)
               });
            });

            let nickname = err ? 'Anonymous' : nick;

            let payload = {
                message: data.message,
                nick: nickname,
                location:localStorage.getItem('userlocal')
            };

            socket.emit('chat',payload);
            socket.broadcast.emit('chat', payload);
        });
    });
});


/*
Use of Radium for Media Queries
*/