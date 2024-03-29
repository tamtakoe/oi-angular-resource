import {Type} from '@angular/core';

export interface ILocalStorageOptions {
  name?: string;
  transformRequest?: (data: any) => any;
  transformResponse?: (data: any) => any;
}
const Storage = localStorage;

const LocalStorageAction = (method: string, options?: ILocalStorageOptions) =>

  // doLocalStorageAction(): any
  // doLocalStorageAction(data): boolean

   function doLocalStorageAction(this: any, data: any = null) {
    const localStorageMethodName = Object.keys(this).find(methodName => this[methodName] === doLocalStorageAction);
    const localStorageConfig = Object.assign({}, this.$localStorageConfig, options);

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

      this.actions.next({type: localStorageMethodName, payload: data, error: null, meta: this.$localStorageConfig});
      return data;

    } catch (error) {
      this.actions.next({type: localStorageMethodName, payload: null, error, meta: this.$localStorageConfig});
      return undefined;
    }
  }
;

export function LoadFromLocalStorage(options?: ILocalStorageOptions) {
  return LocalStorageAction('load', options);
}

export function SaveToLocalStorage(options?: ILocalStorageOptions) {
  return LocalStorageAction('save', options);
}

export function RemoveFromLocalStorage(options?: ILocalStorageOptions) {
  return LocalStorageAction('remove', options);
}

export function LocalStorageConfig(options?: ILocalStorageOptions) {
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
      instance.$localStorageConfig = Object.assign({
        name: String(Math.random()),
        transformRequest: JSON.stringify,
        transformResponse: JSON.parse
      }, instance.$localStorageConfig, options);

      return instance;
    };

    newConstructor.prototype = Object.create(target.prototype);

    return newConstructor;
  };
}
