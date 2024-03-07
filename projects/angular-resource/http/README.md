# @angular-resource/http
HTTP-adapter of angular-resource

Allows http requests. Wraps HttpClientModule

### Example
```ts
// current-user.resource.ts
import { ReactiveResource } from '@angular-resource/core';
import { HttpConfig, HttpMethod, Get, Post, Put, Patch, Delete, Options, Head, Jsonp} from '@angular-resource/http';

export interface GetUserReq {
  id: number
}
export interface User {
  id: number;
  name: string;
}

@HttpConfig({
  host: 'http://test.com/api',
  url: '/users/:id',
  headers: { 
    Authorization: 'some-token' 
  },
  withCredentials: true,
  transformResponse (response, options) {
    if (options.isArray) {
      return response.data
    }
    return response;
  }
})
export class CurrentUserResource extends ReactiveResource {
  query   = Get({isArray: true});
  get     = Get();
  create  = Post();
  update  = Patch();
  replace = Put();
  delete  = Delete();

  getSpecialUser: HttpMethod<GetUserReq, User[]> = Get({ url: '/users/special:', cancelDuplicates: true });
}
```

```js
// app.component.ts
import { CurrentUserResource } from './_resources/current-user.resource';

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
  }
}
```

### HttpConfig
- `url` _string_ - Resource URL or path. If not absolute (http/https) then shoul be added to host
- `host` _string_ - Resource host. Constant part of url
- `body` _any_ - Request body (for POST, PUT, PATCH etc. methods)
- `headers` _{ [key: string]: string | string[] }_ - HTTP headers
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


See also: [angular-resource documentation](https://github.com/tamtakoe/oi-angular-resource)
