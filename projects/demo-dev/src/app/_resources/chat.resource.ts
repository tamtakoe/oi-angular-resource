import { ReactiveResource, StateConfig } from '../../../../angular-resource/core/src/public-api';
import { HttpConfig, Get } from '../../../../angular-resource/http/src/public-api';
import { SocketIoConfig, CloseSocketIo, OpenSocketIo, SendSocketIoEvent } from '../../../../angular-resource/socket-io/src/public-api';
import { environment as config } from '../../environments/environment';
import { Injectable } from '@angular/core';

@Injectable()
@HttpConfig({
  host: config.resources.chat.httpHost,
  url: '/messages/:id',
})
@SocketIoConfig({
  url: config.resources.chat.socketIoHost
})
@StateConfig({
  initialState: {
    messages: [],
    isLoading: false,
    isError: false
  },
  updateState: (state, action) => { 
    switch (action.type) {
      case 'getMessages:start':
        return {...state, isLoading: true}

      case 'getMessages':
        return action.error 
          ? {...state, isError: true, isLoading: false}
          : {...state, messages: action.payload, isError: false, isLoading: false}

      case 'newMessage':
        return {...state, messages: [...state.messages, action.payload]};

      case 'connect':
        return {...state, isError: !!action.error}

      default:
        return state;
    }
  }
})
export class ChatResource extends ReactiveResource {
  getMessages = Get();
  connect  = OpenSocketIo();
  disconnect = CloseSocketIo();
  sendMessage = SendSocketIoEvent('sendMessage');

  constructor() {
    super()

    this.error('getMessages').subscribe(error => {
      if ((this as any).$socketio.connected) {
        setTimeout(() => {
          console.log('HTTP reconnect...')
          this.getMessages()
        }, 5000)
      } 
    })
    this.error('connect').subscribe(error => {
      console.log(2, error)
      setTimeout(() => {
        console.log('WS reconnect...')
        this.connect()
      }, 7000)
    })
  }
}
