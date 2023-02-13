# AngularResource (WIP)
Angular reactive/http/etc resource (AngularJS like)

You can use it like AngularJS resource, or like event driven library if you follow reactive way.
E.g. you have chat app. So, you just add http methods for getting all messages and web-socket methods for others and it works in one stream! You also can use internal state of the resource (all or last page of chat messages in our example) and make reducer in the Redux style if you prefer this

## Example
If you plan to use HTTP resource you should import Angular HttpClientModule or AngularResourceModule from oi-angular-resource

app.module.ts
```js
import { AngularResourceModule } from 'oi-angular-resource';

@NgModule({
    ...
    imports: [AngularResourceModule]
})
...
```

First you need to extend base reactiveResource by extra http, websockets and other methods what you need and adjust them by default values etc.

api-resource.ts
```js

import { ReactiveResource, StateConfig } from 'oi-angular-resource/core';
import { HttpConfig, HttpMethod, Get, Post, Put, Patch, Delete, Options, Head, Jsonp} from 'oi-angular-resource/http';
import { WebSocketConfig, Open, Close, Send } from 'oi-angular-resource/web-socket';
import { LocalStorageConfig, LoadFromLocalStorage, SaveToLocalStorage, RemoveFromLocalStorage } from 'oi-angular-resource/local-storage';

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

export * from 'oi-angular-resource/core';
export * from 'oi-angular-resource/http';
export * from 'oi-angular-resource/web-socket';
export * from 'oi-angular-resource/local-storage';
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

Resource mock for unit tests. Example
```js
import {createMockClass, ApiResource} from './_resources/api-resource';

...

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AngularResourceModule
      ],
      providers: [
        { provider: ApiResource, useClass: createMockClass(ApiResource) }
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

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Update NPM version

Run `npm version patch/minor/major` inside root and project/angular-resource directory

## Build

Run `ng build angular-resource` to build the project. The build artifacts will be stored in the `angular-resource/dist/` directory.

## Publishing

After building your library with `ng build angular-resource`, go to the dist folder `cd dist/angular-resource` and run `npm publish`.

## Running unit tests

Run `ng test angular-resource` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e angular-resource` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
