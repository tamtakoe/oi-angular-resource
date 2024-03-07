import { Action } from '@angular-resource/core';
import { Type } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';

export interface IPubSubConfig {
  timeout?: number;
  observable?: boolean;
  publish?: (data?: Action) => void;
  subscriber?: Observable<Action>;
  autoConnect?: boolean;
}

const defaultConfig = {
  timeout: 10000, // 10s
  observable: false,
  autoConnect: true
}

export function Send(editorConfig: IPubSubConfig = {}) {
  return function doSend(this: any, data?: any, config: IPubSubConfig = {}): any {
    const sendMethodName: string = Object.keys(this).find(methodName => this[methodName] === doSend) || '';
    const sendConfig = Object.assign({}, defaultConfig, this.$editorConfig, editorConfig, config);
    
    const observable = new Observable((subscriber: Subscriber<any>) => {
      const messageId = String(Math.round(Math.random() * 100000));
      const message = {id: messageId, type: sendMethodName, payload: data, meta: sendConfig}

      if (sendConfig.timeout) {
        const subscription = this.actions.subscribe((action: any) => {
          if (action.type === sendMethodName && action.id === messageId) {
            subscription.unsubscribe();
            subscriber.next(action.payload);
            subscriber.complete();
          }
        })
  
        setTimeout(() => {
          subscription.unsubscribe();
          subscriber.error(new Error(`Request Timeout (${sendConfig.timeout} ms)`))
        }, sendConfig.timeout)

      } else {
        subscriber.complete();
      }
      
      sendConfig.publish(message);
      this.actions.next({ ...message, type: sendMethodName + ':start' })
    });

    return config.observable ? observable : observable.toPromise();
  }
}

export function Open(config: IPubSubConfig = {}) {
  return function doOpen(this: any): any {
    const openMethodName = Object.keys(this).find(methodName => this[methodName] === doOpen);
    const openConfig = Object.assign({}, defaultConfig, this.$editorConfig, config);

    if (this.$editorConnection) {
      return Promise.resolve();
    }

    this.$editorConnection = openConfig.subscriber.subscribe((data: Action) => {
      this.actions.next({meta: this.$editorConfig, ...data});
    });

    this.actions.next({type: openMethodName + ':start', payload: null, error: null, meta: this.$editorConfig});
    this.actions.next({type: openMethodName, payload: null, error: null, meta: this.$editorConfig});
    return Promise.resolve();
  }
}

export function Close() {
  return function doClose(this: any): any {
    const closeMethodName = Object.keys(this).find(methodName => this[methodName] === doClose);
    this.$editorConnection.unsubscribe();
    this.$editorConnection = null;

    this.actions.next({type: closeMethodName + ':start', payload: null, error: null, meta: this.$editorConfig});
    this.actions.next({type: closeMethodName, payload: null, error: null, meta: this.$editorConfig});
    return Promise.resolve();
  }
}

export function PubSubConfig(config?: IPubSubConfig) {
  return (target: Type<void>) => {
    const original = target;

    // NOTE: If you see `Error: No provider for $SomeLocalStorage$Resource!` it means that you need provider for Resource
    // which was extended from base Resource. You can add this to `providers` array of app.module
    const newConstructor: any = function $SomeLocalStorage$Resource(...args: any[]) {
      const c: any = function childConstructor(...args2: any[]) {
        return new original(...args2);
      };
      c.prototype = Object.create(original.prototype);
      const instance = new c(...args);

      // Set options
      instance.$editorConfig = Object.assign({}, defaultConfig, instance.$editorConfig, config);

      if (instance.$editorConfig.autoConnect) {
        Open().apply(instance);
      }

      return instance;
    };

    newConstructor.prototype = Object.create(target.prototype);

    return newConstructor;
  };
}

