# angular-resource
Angular reactive/http/etc resource (AngularJS like)

You can use it like AngularJS resource, or like event-driven library if you are following a reactive way.
E.g. you have chat app. So, you just add http-methods for getting all messages and websocket-methods for get/send new messages and it works in one stream! You also can use internal state of the resource and make reducer in the Redux style if you prefer this one

## Install
Install core package and adapters what you need
```shell
npm install @angular-resource/core
npm install @angular-resource/http
npm install @angular-resource/local-storage
npm install @angular-resource/socket-io
npm install @angular-resource/websocket
```

## Quick start demo
```shell
npm run start:server # simple api server
npm run start:demo   # demo page
open http://localhost:4200
```

## Example
The first thing to do is to extend the base ReactiveResource class and decorate it by http, websockets and other adapters what you need.

api-resource.ts
```js

import { ReactiveResource, StateConfig } from '@angular-resource/core';
import { HttpConfig, HttpMethod, Get, Post, Put, Patch, Delete, Options, Head, Jsonp} from '@angular-resource/http';
import { WebSocketConfig, Open, Close, Send } from '@angular-resource/websocket';
import { LocalStorageConfig, LoadFromLocalStorage, SaveToLocalStorage, RemoveFromLocalStorage } from '@angular-resource/local-storage';

@WebSocketConfig({
  url: 'wss://some-url',
  protocols: [],
  onMessageEventName: 'msg'
})
@LocalStorageConfig({
  name: 'myStorage', // Random string
  transformRequest: JSON.stringify,
  transformResponse: JSON.parse
})
@HttpConfig({
  host: 'http://test.com',
  headers: {Authorization: 'some-token'},
  withCredentials: true,
  transformResponse (response, options) {
    if (options.isArray) {
      return response.data
    }
    return response;
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

export * from '@angular-resource/core';
export * from '@angular-resource/http';
export * from '@angular-resource/web-socket';
export * from '@angular-resource/local-storage';
```

You can extend and adjust your resource as many times as you want. New options will be merged

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

Then you can use this resource where you want (Promise, Observable, simple/reactive forms, any cases)

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
        console.error(error)
      })
      
    // Event-driven way (Observable)
    this.currentUser.actions.next({type: 'customEvent', payload: 123});
    this.currentUser.actions.next({type: 'customError', error: 'Err123'});

    this.currentUser.actions.subscribe(action => {
      console.log(action); // {type: 'customEvent', payload: 123} and {type: 'customError', error: 'Err123'}
    });

    this.currentUser.errors.subscribe(error => {
      console.log(error); // Err123
    });

    // Or with sugar
    this.currentUser.action('event1').next(123);
    this.currentUser.error('event2', 'event3').next('Err123');

    this.currentUser.action('event1', 'event2', 'event3').subscribe(payload => {
      console.log(payload); // 123
    });

    this.currentUser.error('event1', 'event2').subscribe(error => {
      console.log(error); // Err123
    });

    // Redux way
    this.currentUser.state.subscribe(state => {
      console.log(state);
    });
  }
}
```

Resource mock for unit tests. Example
```js
import {createMockClass, ApiResource} from './_resources/api-resource';

...

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        { provide: ApiResource, useClass: createMockClass(ApiResource) }
      ],
      declarations: [
        AppComponent
      ],
    }).compileComponents();
  });

...
```

### HTTP config
- `url` _string_ - URL
- `host` _string_ - HOST
- `body` _any_ - Request BODY (for POST, PUT, PATCH etc. methods)
- `headers` _{ [key: string]: string | string[] }_ - HEADERS
- `params` _any_ - QUERY | Template | etc. params

- `observable` _boolean_ - Response is Observable or Promise
- `noTrailingSlash` _boolean_ - Remove trailing slash
- `withCredentials` _boolean_ - Use credentials
- `isArray` _boolean_ - Result is in array
- `reportProgress` _boolean_ - ?
- `responseType` _arraybuffer | blob | json | text_ - Response type
- `transformRequest` _(request: Request, httpConfig: IHttpConfig) => any_
- `transformResponse` _(response: any, httpConfig: IHttpConfig) => any_
- `transformErrorResponse` _(errorResponse: HttpErrorResponse, httpConfig: IHttpConfig) => HttpErrorResponse | never | any_ - (Return undefined or NEVER to prevent this event)

- `mock` _(req: Request, httpConfig: IHttpConfig) => any_ - Server mock
- `cache` _boolean_ - Cache similar request
- `cancelDuplicates` _boolean_ - Cancel previous duplicate requests


## Development server

Run `npm run start:server` to start demo server to use websocket communication

Run `npm run start:demo-dev` to start demo application which imports source of angular-resource. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

Run `npm run start:demo` to start demo application which imports build of angular-resource (from dist folder). Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.


## Update NPM version

Run `npm version patch --prefix projects/angular-resource/<project>` (minor, major) to update root project version for each component what you need


## Build

Run `npm run build` to build the project. The build artifacts will be stored in the `/dist` directory.


## Publishing

Optional run `npm pack --dry-run --workspaces` to check that projects packed successful

Run `npm publish --workspaces --access=public` to publish all packages or `npm publish --workspace=@angular-resource/core --access=public` for single package (e.g. core)


## Running unit tests

Run `npm test @angular-resource/core` to execute the unit tests (e.g. for core package) via [Karma](https://karma-runner.github.io).



## Create new adapters etc.

Do it by analogy
```shell
ng new oi-angular-resource --no-create-application
cd oi-angular-resource
ng generate library @angular-resource/core
ng generate library @angular-resource/http
ng generate library @angular-resource/local-storage
ng generate library @angular-resource/socket-io
ng generate library @angular-resource/websocket
ng generate application demo
ng generate application demo-dev
```
