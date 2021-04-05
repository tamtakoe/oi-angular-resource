import { Observable, Observer, Subject, ReplaySubject } from 'rxjs';
import { map, filter, pluck, tap } from 'rxjs/operators';
// import { Observer } from 'rxjs/Observer';
// import { PartialObserver } from 'rxjs/Observer';
// import { Subject } from 'rxjs/Subject';
// import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Injector, Inject, Type, Injectable } from '@angular/core';
// import 'rxjs/add/operator/toPromise';
// import 'rxjs/add/operator/map';
// import 'rxjs/add/operator/pluck';
// import 'rxjs/add/operator/filter';
// import 'rxjs/add/operator/do';

// TODO implement clean state and unsubscribing

export interface Action {
  type: string;
  payload?: any;
  error?: any;
  meta?: any;
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
      pluck('payload')
    );

    return this.$actions[type] = Subject.create(observer, observable);
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
