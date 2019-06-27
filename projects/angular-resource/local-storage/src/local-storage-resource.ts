import {Type} from '@angular/core';
import {ReactiveResource} from '@oi-angular-resource/core';

const Storage = localStorage;

const LocalStorageAction = (method: string, options) => {

  // doLocalStorageAction(): any
  // doLocalStorageAction(data): boolean

  return function doLocalStorageAction(data = null) {
    const localStorageMethodName = Object.keys(this).find(methodName => this[methodName] === doLocalStorageAction);
    const localStorageConfig = Object.assign({}, this._localStorageConfig, options);

    this.actions.next({type: localStorageMethodName + ':start', payload: null, error: null, meta: localStorageConfig});

    try {
      if (method === 'load') {
        data = localStorageConfig.transformResponse(Storage.getItem(localStorageConfig.name));
      }

      if (method === 'save') {
        Storage.setItem(localStorageConfig.name, localStorageConfig.transformRequest(data));
      }

      if (method === 'remove') {
        Storage.removeItem(localStorageConfig.name);
      }

      this.actions.next({type: localStorageMethodName, payload: data, error: null, meta: this._localStorageConfig});
      return data || true;

    } catch (error) {
      this.actions.next({type: localStorageMethodName, payload: null, error: error, meta: this._localStorageConfig});
      return false;
    }
  }
};

export function LoadFromLocalStorage(options?: {name?: string, transformRequest?: Function, transformResponse?: Function}) {
  return LocalStorageAction('load', options);
}

export function SaveToLocalStorage(options?: {name?: string, transformRequest?: Function, transformResponse?: Function}) {
  return LocalStorageAction('save', options);
}

export function RemoveFromLocalStorage(options?: {name?: string, transformRequest?: Function, transformResponse?: Function}) {
  return LocalStorageAction('remove', options);
}

export function LocalStorageConfig(options?: {name?: string, transformRequest?: Function, transformResponse?: Function}) {
  return (target: Type<ReactiveResource>) => {
    const original = target;

    // NOTE: If you see `Error: No provider for $SomeLocalStorage$Resource!` it means that you need provider for Resource
    // which was extended from base Resource. You can add this to `providers` array of app.module
    const newConstructor: any = function $SomeLocalStorage$Resource(...args) {
      const c: any = function childConstructor() {
        return original.apply(this, arguments);
      };
      c.prototype = Object.create(original.prototype);
      const instance = new c(...args);

      // Set options
      instance._localStorageConfig = Object.assign({
        name: String(Math.random()),
        transformRequest: JSON.stringify,
        transformResponse: JSON.parse
      }, instance._localStorageConfig, options);

      return instance;
    };

    newConstructor.prototype = Object.create(target.prototype);

    return newConstructor;
  };
}
