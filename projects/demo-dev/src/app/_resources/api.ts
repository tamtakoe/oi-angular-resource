import { ReactiveResource, StateConfig } from '../../../../angular-resource/core/src/public-api';
import {
  HttpConfig,
  HttpMethod,
  Get, Post, Put, Patch, Delete, Options, Head, Jsonp
} from '../../../../angular-resource/http/src/public-api';
import {
  WebSocketConfig,
  Open, Close, Send
} from '../../../../angular-resource/websocket/src/public-api';
import {
  SocketIoConfig,
  CloseSocketIo,
  OpenSocketIo,
  SendSocketIo, SendSocketIoEvent,
} from '../../../../angular-resource/socket-io/src/public-api';
import {
  LocalStorageConfig,
  LoadFromLocalStorage,
  SaveToLocalStorage,
  RemoveFromLocalStorage
} from '../../../../angular-resource/local-storage/src/public-api';

import { environment as config } from '../../environments/environment';
import { Injectable } from '@angular/core';

@Injectable()
@WebSocketConfig({
  url: config.resources.websocket.url,
  protocols: []
})
@SocketIoConfig({
  url: config.resources.socketio.url,
  json: false,
  options: {}
})
@HttpConfig({
  noTrailingSlash: true,
  host: config.resources.jsonplaceholder.host,
  headers: config.resources.jsonplaceholder.headers,
  params: config.resources.jsonplaceholder.params,
  withCredentials: config.resources.jsonplaceholder.withCredentials,
  transformResponse(response, options) {
    let newResponse = response;

    if (response && options.isArray) {
      newResponse = Array.isArray(response.data) ? response.data : [];

      for (const key in response) {
        if (key !== 'data' && response.hasOwnProperty(key)) {
          newResponse[key] = response[key];
        }
      }
    }

    return newResponse;
  },
  transformErrorResponse(error, options) {
    if (error.status === 401 && error.error && error.error.redirectUrl) {
      window.location.replace(error.error.redirectUrl);
    }
    // const locationUrl = error.headers.get('location');
    return null;
  }
})
@LocalStorageConfig({
  name: 'ls'
})
export class ApiResource extends ReactiveResource {
  // Http methods
  // query: HttpMethod<{limit?: number}, [{id, type}]>   = Get({isArray: true});
  query   = Get({ isArray: true });
  get     = Get();
  create  = Post();
  update  = Patch();
  replace = Put();
  delete  = Delete();

  // Web socket methods
  open    = Open();
  close   = Close();
  send    = Send();

  // Socket.IO methods
  openSocketIo    = OpenSocketIo();
  closeSocketIo   = CloseSocketIo();
  sendSocketIo    = SendSocketIo();
  sendSocketIoEvent = SendSocketIoEvent('someEvent');

  // Local storage
  loadFromLocalStorage = LoadFromLocalStorage();
  saveToLocalStorage = SaveToLocalStorage();
  removeFromLocalStorage = RemoveFromLocalStorage();
}

export * from '../../../../angular-resource/core/src/public-api';
export * from '../../../../angular-resource/http/src/public-api';
export * from '../../../../angular-resource/local-storage/src/public-api';
export * from '../../../../angular-resource/websocket/src/public-api';
export * from '../../../../angular-resource/socket-io/src/public-api';
