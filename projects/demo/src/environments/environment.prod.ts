export const environment = {
  production: true,
  resources: {
    github: {
      host: 'https://api.github.com',
      headers: {},
      params: {},
      withCredentials: true
    },
    jsonplaceholder: {
      host: 'https://jsonplaceholder.typicode.com',
      headers: {},
      params: {},
      withCredentials: false   
    },
    websocket: {
      url: 'ws://0.0.0.0:9000'
    },
    socketio: {
      url: 'http://127.0.0.1:3000',
    },
    chat: {
      httpHost: 'http://127.0.0.1:3000',
      socketIoHost: 'ws://127.0.0.1:3000'
    }
  },
};
