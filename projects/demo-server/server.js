const WebSocket = require('ws');
const wsServer = new WebSocket.Server({ port: 9000 });

wsServer.on('connection', onConnect);

function onConnect(wsClient) {
  // setInterval(function() {
  //   wsClient.send('Test WS');
  // }, 2000);

  wsClient.send('Connection success');

  wsClient.on('close', function() {
    console.log('Connection closed');
  });

  wsClient.on('message', function(message) {
    console.log(message);
    try {
      const jsonMessage = JSON.parse(message);
      switch (jsonMessage.action) {
        case 'ECHO':
          wsClient.send(jsonMessage.data);
          break;
        case 'PING':
          setTimeout(function() {
            wsClient.send('PONG');
          }, 2000);
          break;
        default:
          console.log('Unknown command');
          break;
      }
    } catch (error) {
      console.log('Error', error);
    }
  });
}

console.log('WebSocket server is listening port 9000');


// const { Server } = require('socket.io');
//
// const io = new Server({ /* options */ });
//
// io.on('connection', (socket) => {
//   // ...
//   console.log('CONNECT', socket.id);
// });
//
//
// io.listen(3000);

const express = require('express');
const app = express();
const server = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"]
  }
});

console.log('SIO');
io.on('connection', socket => {
  console.log('CONNECTION');
  socket.on('event', data => {
    console.log('EVENT', data);
  });
  socket.on('socketIoTest', data => {
    console.log('socketIoTest EVENT', data);
  });
  socket.on('someEvent', data => {
    console.log('SOME EVENT', data);
  });
  socket.on('disconnect', () => {
    console.log('DISCONNECT');
  });

  setInterval(() => {
    socket.emit('request', 'REQ');
  }, 2000);

  setInterval(() => {
    io.emit('broadcast', 'BRDC');
  }, 5000)
}, error => {
  console.log('ERR', error)
});
server.listen(3000, () => {
  console.log('listening on *:3000');
});

// io.on('connection', socket => {
//   socket.emit('request', /* … */); // emit an event to the socket
//   io.emit('broadcast', /* … */); // emit an event to all connected sockets
//   socket.on('reply', () => { /* … */ }); // listen to the event
// });
