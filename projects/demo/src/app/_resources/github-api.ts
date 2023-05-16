import { ReactiveResource, StateConfig } from '@angular-resource/core';
import {
  HttpConfig,
  HttpMethod,
  Get, Post, Put, Patch, Delete, Options, Head, Jsonp
} from '@angular-resource/http';
import {
  WebSocketConfig,
  Open, Close, Send
} from '@angular-resource/websocket';
import {
  SocketIoConfig,
  CloseSocketIo,
  OpenSocketIo,
  SendSocketIo, SendSocketIoEvent,
} from '@angular-resource/socket-io';
import {
  LocalStorageConfig,
  LoadFromLocalStorage,
  SaveToLocalStorage,
  RemoveFromLocalStorage
} from '@angular-resource/local-storage';

import { environment as config } from '../../environments/environment';
import { Injectable } from '@angular/core';


// If we use undefined headers Angular will throw exceptions
const matchedCookie = document.cookie.match(/IbAuthCookie=([0-9a-z-]+)(;|$)/);
const IbAuthCookie = matchedCookie && matchedCookie[1];
// const resources: any = Object.assign({}, config.resources);
const githubApi: any = Object.assign({}, config.resources.github);
let defaultHeaders = {};

// TODO Remove this shit for case with normal authorization
if (IbAuthCookie) {
  defaultHeaders = {Authorization: `IBSSO ${IbAuthCookie}`};

} else if (githubApi.authorization) {
  defaultHeaders = {Authorization: githubApi.authorization};
}

githubApi.headers = Object.assign(defaultHeaders, githubApi.headers);

@Injectable()
@WebSocketConfig({
  url: 'ws://0.0.0.0:9000',
  protocols: []
})
@SocketIoConfig({
  url: 'ws://127.0.0.1:3000',
  options: {}
})
@HttpConfig({
  noTrailingSlash: true,
  host: githubApi.host,
  headers: githubApi.headers,
  params: githubApi.params,
  withCredentials: githubApi.withCredentials,
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
export class GithubApi extends ReactiveResource {
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
