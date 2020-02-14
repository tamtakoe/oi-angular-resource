import {WebSocketMock} from './web-socket-mock';
import {Type} from '@angular/core';
import {ReactiveResource} from 'oi-angular-resource/core';

const NUMBER_OF_ATTEMPTS = 10; // ~20-30 sec.

function close() {
  const closeMethodName = Object.keys(this).find(methodName => this[methodName] === close);
  this._ws.close();
  this.actions.next({type: closeMethodName + ':start', payload: null, error: null, meta: this._wsConfig});

  return new Promise((resolve, reject) => {
    this.actions.do(action => {
      if (action.type === this._wsCloseMethodName) {
        resolve(action.payload);
      }
    })
  });
}

function send(data) {
  const sendMethodName = Object.keys(this).find(methodName => this[methodName] === send);

  this.actions.next({type: sendMethodName + ':start', payload: data, error: null, meta: this._wsConfig});

  try {
    this._ws.send(data);
    this.actions.next({type: sendMethodName, payload: data, error: null, meta: this._wsConfig});

  } catch (error) {
    this.actions.next({type: sendMethodName, payload: null, error: error, meta: this._wsConfig});
  }

  return Promise.resolve(data)
}

//TODO Check tha we have one ws instance for our app!
export function Open(options?) {
  let reconnectCount = 0;

  return function open() {
    if (this._ws) {
      return Promise.resolve(this._ws)
    }

    const wsConfig = this._wsConfig = Object.assign(this._wsConfig, options);

    let ws = this._ws = new WebSocketMock(wsConfig.url, wsConfig.protocols);

    // wsConfig.ws = ws;
    wsConfig.reconnect = wsConfig.reconnect === true ? NUMBER_OF_ATTEMPTS : wsConfig.reconnect;

    if (wsConfig.binaryType) {
      ws.binaryType = wsConfig.binaryType;
    }

    if (wsConfig.extensions) {
      ws.extensions = wsConfig.extensions;
    }

    if (wsConfig.protocol) {
      ws.protocol = wsConfig.protocol;
    }

    const openMethodName = Object.keys(this).find(methodName => this[methodName] === open);
    const closeMethodName = Object.keys(this).find(methodName => this[methodName] === close);

    return new Promise((resolve, reject) => {
      this.actions.next({type: openMethodName + ':start', payload: null, error: null, meta: wsConfig});

      ws.onopen = () => {
        resolve(ws);
        reconnectCount = 0;
        this.actions.next({type: openMethodName, payload: null, error: null, meta: wsConfig})
      };

      ws.onmessage = event => {
        this.actions.next({type: wsConfig.onMessageEventName, payload: event, error: null, meta: wsConfig})
      };

      ws.onerror = error => {
        this.actions.next({type: wsConfig.onMessageEventName, payload: null, error: error, meta: wsConfig})
      };

      ws.onclose = event => {
        console.log('THIS', this, closeMethodName);
        ws = this._ws = null;
        reject(event);
        this.actions.next({type: closeMethodName, payload: event, error: null, meta: wsConfig});

        // Arithmetic progression 500ms 1000ms 1500ms 2000ms ... ${wsConfig.reconnect} times
        if (event.code !== 1000 && reconnectCount < wsConfig.reconnect) {
          setTimeout(() => {
            open.apply(this);
            reconnectCount++;
          }, 500 * reconnectCount);

        } else {
          reject(event);
        }
      };
    });
  };
}

export function Close() {
  return close;
}

export function Send() {
  return send;
}

export function WebSocketConfig(options?: {url?, protocols?, binaryType?, extensions?, protocol?, reconnect?, onMessageEventName?}) {
  return (target: Type<void>) => {
    const original = target;

    // NOTE: If you see `Error: No provider for $SomeWs$Resource!` it means that you need provider for Resource
    // which was extended from base Resource. You can add this to `providers` array of app.module
    const newConstructor: any = function $SomeWs$Resource(...args) {
      const c: any = function childConstructor() {
        return new original(...arguments);
      };
      c.prototype = Object.create(original.prototype);
      const instance = new c(...args);

      // Set options
      instance._wsConfig = Object.assign({onMessageEventName: 'message'}, instance._wsConfig, options);

      return instance;
    };

    newConstructor.prototype = Object.create(target.prototype);

    return newConstructor;
  };
}
