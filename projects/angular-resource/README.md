# AngularResource (WIP)
Angular reactive/http/etc resource (AngularJS like)

You can use it like AngularJS resource, or like event driven library if you follow reactive way.
E.g. you have chat app. So, you just add http methods for getting all messages and web-socket methods for others and it works in one stream! You also can use internal state of the resource (all or last page of chat messages in our example) and make reducer in the Redux style if you prefer this

## Example

First you need to extend base reactiveResource by extra http, websockets and other methods what you need and adjust them by default values etc.

api-resourse.ts
```js

import { ReactiveResource, StateConfig } from '@oi-angular-resource/core';
import { HttpConfig, HttpMethod, Get, Post, Put, Patch, Delete, Options, Head, Jsonp} from '@oi-angular-resource/http';
import { WebSocketConfig, Open, Close, Send } from '@oi-angular-resource/web-socket';
import { LocalStorageConfig, LoadFromLocalStorage, SaveToLocalStorage, RemoveFromLocalStorage } from '@oi-angular-resource/local-storage';

@WebSocketConfig({
  url: 'wss://some-url',
  protocols: [],
  onMessageEventName: 'msg'
})
@LocalStorageConfig({
  name: 'myStorage', // Random string
  transformRequest: trReqFunc, // JSON.stringify
  transformResponse: trResFunc // JSON.parse
})
@HttpConfig({
  host: 'http://test.com',
  headers: {Authorization: 'some-token'},
  withCredentials: true,
  transformResponse (response, options) {
    //...
    return newResponse;
  }
})
export class ApiResourceExample extends ReactiveResource {
  // Http methods
  query   = Get({isArray: true});
  get     = Get();
  create  = Post();
  update  = Patch();
  replace = Put();
  delete  = Delete();

  // Web socket methods
  open    = Open();
  close   = Close();
  send    = Send();

  // Local storage
  loadFromLocalStorage   = LoadFromLocalStorage();
  saveToLocalStorage     = SaveToLocalStorage();
  removeFromLocalStorage = RemoveFromLocalStorage();
}

export * from '@oi-angular-resource/core';
export * from '@oi-angular-resource/http';
export * from '@oi-angular-resource/web-socket';
export * from '@oi-angular-resource/local-storage';
```

You can extend and adjust your resouce as many times as you want. New options will be merged

current-user.ts
```js
import { Injectable } from '@angular/core';
import { ApiResourceExample, HttpConfig, StateConfig, Get, Post, Put, Patch, Delete } from './api-resource';

@Injectable()
@HttpConfig({
  url: '/users/current',
})
@StateConfig({
  initialState: {},
  updateState: (state, action) => { // Reducer
    if (action.error) {
      return state;
    }
    switch (action.type) {
      case 'get':
        return action.payload;
      default:
        return state;
    }
  }
})
export class CurrentUserResource extends ApiResourceExample {
  customMethod: Get({/* options */})
}
```

Then you can use this resorce where you want (Promise, Observable, simple/reactive forms, any cases)

app.ts
```js
import { CurrentUserResource } from './resources/current-user.res';

@Component({
  selector: 'app',
  templateUrl: './app.component.html',
  providers: [CurrentUserResource]
})
export class AppComponent implements OnInit {

constructor(
  private currentUser: CurrentUserResource,
) {}
  
public ngOnInit() {
  // Common way (Promise)
  this.currentUser.get()
    .then(user => {
      console.log(user)
    })
    .catch(error => {
      console.log(error)
    })
    
  // Reactive way (Observable)
  this.currentUser.state.subscribe(state => {
    console.log(state);
  });

  this.currentUser.errors.subscribe(error => {
    console.log(error);
  });
  
  // Use custom events (Subject)
  this.currentUser.actions.next({type: 'custom', payload: 123});
  
  this.currentUser.actions.subscribe(action => {
    console.log(action); //{type: 'custom', payload: 123}
  });

  // Or with sugar
  this.currentUser.action('someEvent').next(123);

  this.currentUser.action('someEvent').subscribe(payload => {
    console.log(payload); //123
  });
}
```


This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.3.8.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build

Run `ng build AngularResource` to build the project. The build artifacts will be stored in the `dist/angular-resource` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
