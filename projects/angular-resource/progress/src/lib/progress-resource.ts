import { Type } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';

export interface IProgressConfig {
  init?: (data?: any) => Promise<any>;
  check?: (checking: IChecking) => any;
  fakeProgressFn?: (x: number) => number;
  interval?: number;
  timeout?: number;
  observable?: boolean;
}

export interface IChecking {
  initData: any;
  next: (data: any) => void;
  complete: (data: any) => void;
  error: (error: any) => void;
  getProgress: (format: string) => number; // Default format is xx.xx (e.g. 15.03%)
}

interface ICheckingConfig {
  onNext: (data?: any) => void,
  onComplete: (data?: any) => void,
  onError: (error?: any) => void,
}

class Checking {
  initData = null;
  #startTimestamp = Date.now();
  #timeoutId: ReturnType<typeof setTimeout>;
  #intervalId: ReturnType<typeof setTimeout> | undefined;
  #progressConfig: IProgressConfig;
  #config: ICheckingConfig;

  constructor(progressConfig: IProgressConfig, config: ICheckingConfig) {
    this.#progressConfig = progressConfig;
    this.#config = config;
    this.#timeoutId = setTimeout(() => {
      this.error(new Error(`Timeout. Process longer than ${this.#progressConfig.timeout || 0 / 1000} s`))
    }, this.#progressConfig.timeout);
  }
  next(data: any) {
    clearTimeout(this.#intervalId);
    this.start();
    this.#config.onNext(data);
  }
  complete(data: any) {
    clearTimeout(this.#intervalId);
    clearTimeout(this.#timeoutId);
    this.#config.onComplete(data);
  }
  error(error: any) {
    clearTimeout(this.#intervalId);
    clearTimeout(this.#timeoutId);
    this.#config.onError(error);
  }
  getProgress(format: string = 'nn.nn') {
    const [i, f] = format.split('.');
    const fakeProgress = (this.#progressConfig.fakeProgressFn ?? easeOut)((Date.now() - this.#startTimestamp) / (this.#progressConfig.timeout || 0));

    return parseFloat((fakeProgress * Math.pow(10, i.length)).toFixed((f || '').length));
  }
  start(data?: any) {
    if (data) {
      this.initData = data;
    }
    this.#intervalId = setTimeout(() => {
      this.#progressConfig.check && Promise.resolve(this.#progressConfig.check(this))
        .then((newConfig: IProgressConfig) => newConfig && Object.assign(this.#progressConfig, newConfig));
    }, this.#progressConfig.interval);
  }
}

const defaultConfig = {
  init: (data?: any) => data,
  check: (data?: any) => data,
  fakeProgressFn: easeOut,
  interval: 10 * 1000, // 10s
  timeout: 10 * 60 * 1000, // 10m
  observable: false
}

export function Progress(config: IProgressConfig) {

  return function doProgress(this: any, ...args: any[]): any {
    const progressMethodName: string = Object.keys(this).find(methodName => this[methodName] === doProgress) || '';
    const progressConfig = Object.assign({}, defaultConfig, this.$progressConfig, config);
    
    const observable = new Observable((subscriber: Subscriber<any>) => {
      const checking = new Checking(progressConfig, {
        onNext: (data) => {
          subscriber.next(data);
          this.actions.next({type: progressMethodName + ':progress', payload: data, error: null, meta: progressConfig})
        },
        onComplete: (data) => {
          subscriber.next(data);
          subscriber.complete();
          this.actions.next({type: progressMethodName, payload: data, error: null, meta: progressConfig})
        },
        onError: (error) => {
          subscriber.error(error);
          this.actions.next({type: progressMethodName, payload: null, error: error, meta: progressConfig})
        }
      });

      this.actions.next({type: progressMethodName + ':start', payload: args[0], error: null, meta: progressConfig})
    
      Promise.resolve(progressConfig.init ? progressConfig.init.apply(this, args) : undefined).then((initData) => {
        checking.start(initData);
        subscriber.next(initData)
        this.actions.next({type: progressMethodName + ':init', payload: initData, error: null, meta: progressConfig})
      })

      return function unsubscribe() {
        checking.error(new Error(`Canceled. Process was canceled`))
      };
    });

    return config.observable ? observable : observable.toPromise();
  }
}

export function ProgressConfig(config?: IProgressConfig) {
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
      instance.$progressConfig = Object.assign({}, instance.$progressConfig, config);

      return instance;
    };

    newConstructor.prototype = Object.create(target.prototype);

    return newConstructor;
  };
}

function easeOut(x: number): number {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x); // exponent
}
