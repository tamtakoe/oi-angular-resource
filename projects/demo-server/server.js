const express = require('express');
const cors = require('cors')
const WebSocket = require('ws');
const messagesDB = require('./messagesDB');
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
corsSettings = {
  origin: "http://localhost:4200",
  methods: ["GET", "POST"]
}

const app = express();
const server = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: corsSettings
});

// Websocket server
console.log('SIO');

let isDemoEventsStreaming = false;

io.on('connection', socket => {
  console.log('CONNECTION');
  socket.on('startServerStream', data => {
    console.log('Demo events stream started', data);
    isDemoEventsStreaming = true;
  });
  socket.on('stopServerStream', data => {
    console.log('Demo events stream canceled', data);
    isDemoEventsStreaming = false;
  });

  socket.on('event', data => {
    console.log('EVENT', data);
  });
  socket.on('socketIoTest', data => {
    console.log('socketIoTest EVENT', data);
  });
  socket.on('someEvent', data => {
    console.log('someEvent EVENT', data);
  });
  socket.on('sendMessage', message => {
    console.log('-> sendMessage EVENT', message);
    const newMessage = { id: ++messagesDB.count, ...JSON.parse(message) };

    messagesDB.messages.push(newMessage)
    socket.emit('newMessage', JSON.stringify(newMessage));
    console.log('<- newMessage EVENT', JSON.stringify(newMessage))
  });
  socket.on('disconnect', () => {
    console.log('DISCONNECT');
  });

  // Streaming of demo events
  setInterval(() => {
    isDemoEventsStreaming && socket.emit('request', 'REQ');
  }, 2000);

  setInterval(() => {
    isDemoEventsStreaming && io.emit('broadcast', 'BRDC');
  }, 5000)
}, error => {
  console.log('ERR', error)
});

// HTTP server
app.use(cors(corsSettings))

app.get('/messages', (req, res) => {
  console.log('Load messages')
  res.send(messagesDB.messages);
})

server.listen(3000, () => {
  console.log('listening on *:3000');
});

// io.on('connection', socket => {
//   socket.emit('request', /* … */); // emit an event to the socket
//   io.emit('broadcast', /* … */); // emit an event to all connected sockets
//   socket.on('reply', () => { /* … */ }); // listen to the event
// });
