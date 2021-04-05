import { WebSocketMock } from './web-socket-mock';
import { Type } from '@angular/core';

// TODO use interfaces from one place
export interface Action2 {
  type: string;
  payload?: any;
  error?: any;
  meta?: any;
}
export interface IWebSocketConfig {
  url?: any;
  protocols?: any;
  binaryType?: any;
  extensions?: any;
  protocol?: any;
  reconnect?: any;
  onMessageEventName?: any;
}
const NUMBER_OF_ATTEMPTS = 10; // ~20-30 sec.

function close(this: any) {
  const closeMethodName = Object.keys(this).find(methodName => this[methodName] === close);
  this.$ws.close();
  this.actions.next({type: closeMethodName + ':start', payload: null, error: null, meta: this.$wsConfig});

  return new Promise((resolve, reject) => {
    this.actions.do((action: Action2) => {
      if (action.type === this.$wsCloseMethodName) {
        resolve(action.payload);
      }
    });
  });
}

function send(this: any, data: any) {
  const sendMethodName = Object.keys(this).find(methodName => this[methodName] === send);

  this.actions.next({type: sendMethodName + ':start', payload: data, error: null, meta: this.$wsConfig});

  try {
    this.$ws.send(data);
    this.actions.next({type: sendMethodName, payload: data, error: null, meta: this.$wsConfig});

  } catch (error) {
    this.actions.next({type: sendMethodName, payload: null, error, meta: this.$wsConfig});
  }

  return Promise.resolve(data);
}

//TODO Check tha we have one ws instance for our app!
export function Open(options?: undefined) {
  let reconnectCount = 0;

  return function open(this: any) {
    if (this.$ws) {
      return Promise.resolve(this.$ws);
    }

    const wsConfig = this.$wsConfig = Object.assign(this.$wsConfig, options);

    let ws = this.$ws = new WebSocketMock(wsConfig.url, wsConfig.protocols);

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
        this.actions.next({type: openMethodName, payload: null, error: null, meta: wsConfig});
      };

      ws.onmessage = event => {
        this.actions.next({type: wsConfig.onMessageEventName, payload: event, error: null, meta: wsConfig});
      };

      ws.onerror = error => {
        this.actions.next({type: wsConfig.onMessageEventName, payload: null, error, meta: wsConfig});
      };

      ws.onclose = event => {
        console.log('THIS', this, closeMethodName);
        // @ts-ignore
        ws = this.$ws = null;
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

export function WebSocketConfig(options?: IWebSocketConfig) {
  return (target: Type<void>) => {
    const original = target;

    // NOTE: If you see `Error: No provider for $SomeWs$Resource!` it means that you need provider for Resource
    // which was extended from base Resource. You can add this to `providers` array of app.module
    const newConstructor: any = function $SomeWs$Resource(...args: any[]) {
      const c: any = function childConstructor(...args2: any[]) {
        return new original(...args2);
      };
      c.prototype = Object.create(original.prototype);
      const instance = new c(...args);

      // Set options
      instance.$wsConfig = Object.assign({onMessageEventName: 'message'}, instance.$wsConfig, options);

      return instance;
    };

    newConstructor.prototype = Object.create(target.prototype);

    return newConstructor;
  };
}
