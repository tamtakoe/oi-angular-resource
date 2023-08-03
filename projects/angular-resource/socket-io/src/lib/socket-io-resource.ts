// import { SocketIoMock } from './socket-io-mock';
import { Type } from '@angular/core';

// TODO use interfaces from one place
interface Action2 {
  type: string;
  payload?: any;
  error?: any;
  meta?: any;
}

import { io } from "socket.io-client";
import {ISocketioConfig} from './socket-io-config';
export {ISocketioConfig} from './socket-io-config';

const WS_NOT_EXIST = new ErrorEvent('Websocket is not opened');
const defaultSocketioConfig = {
  json: true
}

function close(this: any) {
  const closeMethodName = Object.keys(this).find(methodName => this[methodName] === close);
  this.actions.next({type: closeMethodName + ':start', payload: null, error: null, meta: this.$socketioConfig});

  if (this.$socketio) {
    return new Promise((resolve, reject) => {
      this.actions.subscribe((action: Action2) => {
        if (action.type === closeMethodName) {
          resolve(action.payload);
        }
      })

      this.$socketio.disconnect();
    });
  } else {
    this.actions.next({type: closeMethodName, payload: null, error: null, meta: this.$socketioConfig});

    return Promise.resolve();
  }
}

function doSend(this: any, sendMethodName: string, eventName: string, data?: any) {
  if (this.$socketioConfig.json) {
    data = JSON.stringify(data);
  }
  this.actions.next({type: sendMethodName + ':start', payload: data, error: null, meta: this.$socketioConfig});

  try {
    this.$socketio.emit(eventName, data);
    this.actions.next({type: sendMethodName, payload: data, error: null, meta: this.$socketioConfig});

  } catch (error) {
    if (!this.$socketio) {
      error = WS_NOT_EXIST;
    }
    this.actions.next({type: sendMethodName, payload: null, error, meta: this.$socketioConfig});
    return Promise.reject(error);
  }

  return Promise.resolve(data);
}

// const Send = () => {
//   return function send(this: any, eventName: string, data?: any) {
//     const sendMethodName = Object.keys(this).find(methodName => this[methodName] === send) + ':' + eventName;
//
//     return doSend.bind(this)(sendMethodName, eventName, data);
//   }
// }
//
// const SendEvent = (eventName: string) => {
//   if (eventName === undefined) {
//     throw 'eventName is required'
//   }
//
//   return function sendEvent(this: any, data?: any) {
//     const sendMethodName = Object.keys(this).find(methodName => this[methodName] === sendEvent) ?? '';
//
//     return doSend.bind(this)(sendMethodName, eventName, data);
//   }
// }

//TODO Check tha we have one ws instance for our app!
export function OpenSocketIo(options?: undefined) {

  // TODO replace to arrow function
  return function open(this: any) {
    if (this.$socketio) {
      return Promise.resolve(this.$socketio);
    }

    const socketioConfig: ISocketioConfig = this.$socketioConfig = Object.assign(this.$socketioConfig, options);

    let socketio = this.$socketio = io(socketioConfig.url, socketioConfig.options);

    // wsConfig.reconnect = wsConfig.reconnect === true ? NUMBER_OF_ATTEMPTS : wsConfig.reconnect;

    const openMethodName = Object.keys(this).find(methodName => this[methodName] === open);
    const closeMethodName = Object.keys(this).find(methodName => this[methodName] === close);
    const sendMethodName = Object.keys(this).find(methodName => this[methodName] === close);

    return new Promise((resolve, reject) => {
      this.actions.next({type: openMethodName + ':start', payload: null, error: null, meta: socketioConfig});

      socketio.on('connect', () => {
        resolve(socketio);
        this.actions.next({type: openMethodName, payload: null, error: null, meta: socketioConfig});
      })

      socketio.on('disconnect', (disconnectReason) => {
        resolve(socketio);
        this.actions.next({type: closeMethodName, payload: disconnectReason, error: null, meta: socketioConfig});

        // @ts-ignore
        socketio = this.$socketio = null;
      })

      socketio.on('connect_error', (error) => {
        reject(error);
        this.actions.next({type: openMethodName, payload: null, error: error, meta: socketioConfig});
      })

      socketio.onAny((event, ...args) => {
        // TODO Whether we should use one argument or all?
        let payload = args[0];

        if (socketioConfig.json) {
          try {
            payload = JSON.parse(payload)
          } catch(error) {}
        }
        this.actions.next({type: event, payload, error: null, meta: socketioConfig});
      });
    });
  };
}

export function CloseSocketIo() {
  return close;
}

export function SendSocketIo() {
  // return Send();

  return function send(this: any, eventName: string, data?: any) {
    const sendMethodName = Object.keys(this).find(methodName => this[methodName] === send) + ':' + eventName;

    return doSend.bind(this)(sendMethodName, eventName, data);
  }
}

export function SendSocketIoEvent(eventName: string) {
  // return SendEvent(eventName);

  if (eventName === undefined) {
    throw 'eventName is required'
  }

  return function sendEvent(this: any, data?: any) {
    const sendMethodName = Object.keys(this).find(methodName => this[methodName] === sendEvent) ?? '';

    return doSend.bind(this)(sendMethodName, eventName, data);
  }
}


export function SocketIoConfig(options?: ISocketioConfig) {
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
      instance.$socketioConfig = Object.assign({}, defaultSocketioConfig, instance.$socketioConfig, options);

      return instance;
    };

    newConstructor.prototype = Object.create(target.prototype);

    return newConstructor;
  };
}
