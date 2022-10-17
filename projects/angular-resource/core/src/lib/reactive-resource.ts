import { Observable, Observer, Subject, ReplaySubject } from 'rxjs';
// import { AnonymousSubject } from 'rxjs/internal/Subject';
import { map, filter } from 'rxjs/operators';
import { Injector, Inject, Type, Injectable } from '@angular/core';
import { Subscription } from 'rxjs';

// TODO implement clean state and unsubscribing

export interface Action {
  type: string;
  payload?: any;
  error?: any;
  meta?: any;
}

export class AnonymousSubject extends Subject<Action> {
  private destination: Observer<Action>;
  constructor(destination: Observer<Action>, source: Observable<Action>) {
    super();
    this.destination = destination;
    this.source = source;
  }

  override next(value: Action) {
    const { destination } = this;
    if (destination?.next) {
      destination.next(value);
    }
  }

  override error(err: Action) {
    const { destination } = this;
    if (destination?.error !== undefined) {
      this.destination.error(err);
    }
  }

  override complete() {
    const { destination } = this;
    if (destination?.complete !== undefined) {
      this.destination.complete();
    }
  }
  _subscribe(subscriber: Partial<Observer<Action>> | undefined) {
    const { source } = this;
    if (source) {
      return this.source?.subscribe(subscriber);
    }
    else {
      return Subscription.EMPTY;
    }
  }
}

export function StateConfig(options: {initialState: any; updateState: (state: any, action: Action) => any}) {
  // return function (target: Type<Resource>) {
  return (target: Type<void>) => {
    const original = target;

    // NOTE: If you see `Error: No provider for $Some$Resource!` it means that you forgot to declare provider for Resource
    // which was extended from ReactiveResource. You can add this to `providers` array of app.module or your component
    const newConstructor: any = function $Some$Resource(...args: any[]) {
      const c: any = function childConstructor(...args2: any[]) {
        return new original(...args2);
      };
      c.prototype = Object.create(original.prototype);
      const instance = new c(...args);

      // Set options
      instance.$state = options.initialState;

      if (options.updateState) {
        instance.$updateState = options.updateState;
      }

      return instance;
    };

    newConstructor.prototype = Object.create(target.prototype);

    return newConstructor;
  };
}

@Injectable()
export class ReactiveResource {
  actions: Subject<Action> = new Subject();
  errors: Observable<any> = this.actions.pipe(
    filter(action => action.error),
    map(action => action.error)
  );
  state: Observable<any>;

  private $state: any = null;
  private $actions: any = {};

  constructor() {
    const stateSubject = new ReplaySubject(1);

    this.state = stateSubject.asObservable();
    this.actions.subscribe(action => {
      const newState = this.$updateState(this.$state, action);

      // Fire event if state is different
      if (newState !== this.$state) {
        this.$state = newState;
        stateSubject.next(newState);
      }
    });
  }

  action(type: string): Subject<any> {
    // TODO fix action('someActionType').unsubscribe()
    // type = Array.isArray(type) ? type : [type];
    // return this.actions
    //   .filter(action => type[0] === '*' || !!(type.indexOf(action.type) + 1)).pluck('payload');

    // this.actions.filter(action => type === action.type).pluck('payload');

    if (this.$actions[type]) {
      return this.$actions[type];
    }

    const observer: Observer<any> = {
      next: payload => this.actions.next({type, payload}),
      error: error => this.actions.error({type, error}),
      complete: () => this.actions.complete(),
    };
    const observable = this.actions.pipe(
      filter(action => type === action.type),
      map(action => action?.payload)
    );

    return this.$actions[type] = new AnonymousSubject(observer, observable);
  }

  getState() {
    return this.$state;
  }

  private $updateState = (state: any, action: Action) => state; // (state, action) => !action.error && action.payload || state; if we need to save any action by default

  // Сделать пример с релейшнами

  // actions: ReplaySubject<{type, payload, error, meta}> = new ReplaySubject(0);
  // state: ReplaySubject<any> = new ReplaySubject(1);

  // state: Observable<any> = Observable.from( this.actions
  //   .map(action => this.$updateState(this.$state, action))
  //   .filter(newState => newState !== this.$state)
  //   .do(newState => this.$state = newState) );

  // asObservable
  //Rx.Observable.from( source )
  // state: Observable<any> = this.actions.asObservable()
  //   // .map(action => this.$state = this.$updateState(this.$state, action))
  //   .map(action => this.$updateState(this.$state, action))
  //   // // .filter(newState => newState !== this.$state ? (this.$state = newState, true) : false);
  //   .filter(newState => newState !== this.$state)
  //   .do(newState => this.$state = newState);
}
declare type Class<T = any> = new (...args: any[]) => T;
// export type Newable = {new (): void} extends ReactiveResource;
const basePropertiesNames = Object.getOwnPropertyNames(new ReactiveResource());

export function createMockClass(OriginalClass: Class, mocks: any = {}): typeof ReactiveResource {
  @Injectable()
  class ResourceMock extends ReactiveResource {
    constructor() {
      super();
      const original: any = new OriginalClass();

      Object.getOwnPropertyNames(original)
        .filter(propertyName => !basePropertiesNames.includes(propertyName) && typeof original[propertyName] === 'function')
        .forEach(methodName => {
          (this as any)[methodName] = mocks[methodName] || ((data?: any) => {
            this.actions.next({type: methodName + ':start', payload: null, error: null, meta: null});
            this.actions.next({type: methodName, payload: data, error: null, meta: null});
            return Promise.resolve();
          })
        });
    }
  }

  return ResourceMock;
}
