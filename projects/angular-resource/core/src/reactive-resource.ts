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

export function StateConfig(options: {initialState: any, updateState: (state: any, action: Action) => any}) {
  // return function (target: Type<Resource>) {
  return (target: Type<void>) => {
    const original = target;

    // NOTE: If you see `Error: No provider for $Some$Resource!` it means that you forgot to declare provider for Resource
    // which was extended from ReactiveResource. You can add this to `providers` array of app.module or your component
    const newConstructor: any = function $Some$Resource(...args) {
      const c: any = function childConstructor() {
        return new original(...arguments);
      };
      c.prototype = Object.create(original.prototype);
      const instance = new c(...args);

      // Set options
      instance._state = options.initialState;

      if (options.updateState) {
        instance._updateState = options.updateState;
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

  constructor() {
    const stateSubject = new ReplaySubject(1);

    this.state = stateSubject.asObservable();
    this.actions.subscribe(action => {
      const newState = this._updateState(this._state, action);

      // Fire event if state is different
      if (newState !== this._state) {
        this._state = newState;
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

    if (this._actions[type]) {
      return this._actions[type];
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

    return this._actions[type] = Subject.create(observer, observable);
  }

  getState() {
    return this._state;
  }

  private _state: any = null;
  private _updateState: Function = state => state; // (state, action) => !action.error && action.payload || state; if we need to save any action by default
  private _actions: any = {};

  // Сделать пример с релейшнами

  // actions: ReplaySubject<{type, payload, error, meta}> = new ReplaySubject(0);
  // state: ReplaySubject<any> = new ReplaySubject(1);

  // state: Observable<any> = Observable.from( this.actions
  //   .map(action => this._updateState(this._state, action))
  //   .filter(newState => newState !== this._state)
  //   .do(newState => this._state = newState) );

  // asObservable
  //Rx.Observable.from( source )
  // state: Observable<any> = this.actions.asObservable()
  //   // .map(action => this._state = this._updateState(this._state, action))
  //   .map(action => this._updateState(this._state, action))
  //   // // .filter(newState => newState !== this._state ? (this._state = newState, true) : false);
  //   .filter(newState => newState !== this._state)
  //   .do(newState => this._state = newState);
}
