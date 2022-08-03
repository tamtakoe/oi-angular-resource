import { ReactiveResource, StateConfig } from '../../../projects/angular-resource/core/src/public_api';
import {
  HttpConfig,
  HttpMethod,
  Get, Post, Put, Patch, Delete, Options, Head, Jsonp
} from '../../../projects/angular-resource/http/src/public_api';
import {
  WebSocketConfig,
  Open, Close, Send
} from '../../../projects/angular-resource/web-socket/src/public_api';
import {
  SocketIoConfig,
  CloseSocketIo,
  OpenSocketIo,
  SendSocketIo, SendSocketIoEvent,
} from '../../../projects/angular-resource/socket-io/src/socket-io-resource';
import {
  LocalStorageConfig,
  LoadFromLocalStorage,
  SaveToLocalStorage,
  RemoveFromLocalStorage
} from '../../../projects/angular-resource/local-storage/src/public_api';

// import { ReactiveResource, StateConfig } from '../../../dist/angular-resource/core';
// import {
//   HttpConfig,
//   HttpMethod,
//   Get, Post, Put, Patch, Delete, Options, Head, Jsonp
// } from '../../../dist/angular-resource/http';
// import {
//   WebSocketConfig,
//   Open, Close, Send
// } from '../../../dist/angular-resource/web-socket';
// import {
//   SocketIoConfig,
//   CloseSocketIo,
//   OpenSocketIo,
//   SendSocketIo, SendSocketIoEvent,
// } from '../../../dist/angular-resource/socket-io';
// import {
//   LocalStorageConfig,
//   LoadFromLocalStorage,
//   SaveToLocalStorage,
//   RemoveFromLocalStorage
// } from '../../../dist/angular-resource/local-storage';


// import config from '../config';
import { environment as config } from '../../environments/environment';
import { Injectable } from '@angular/core';


// import {ConfigService} from './config.service';

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

export * from '../../../projects/angular-resource/core/src/public_api';
export * from '../../../projects/angular-resource/http/src/public_api';
export * from '../../../projects/angular-resource/web-socket/src/public_api';
export * from '../../../projects/angular-resource/socket-io/src/public_api';
