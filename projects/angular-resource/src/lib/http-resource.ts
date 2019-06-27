import { HttpClient, HttpHeaders, HttpParams, HttpRequest, HttpResponse, HttpErrorResponse, HttpResponseBase } from '@angular/common/http';
import { UrlTemplate } from './url-template';
import { ReactiveResource } from './reactive-resource';
import { RequestCacheWithMap } from './request-cache';
import { Type } from '@angular/core';
import {Observable, of, throwError, NEVER} from 'rxjs';
import { map, tap, filter, catchError } from 'rxjs/operators';
// import 'rxjs/add/operator/toPromise';
// import 'rxjs/add/operator/map';
// import 'rxjs/add/operator/do';
//
// import 'rxjs/add/operator/take';
// import 'rxjs/add/operator/defaultIfEmpty';
// import 'rxjs/add/operator/share';
// import 'rxjs/add/observable/from';

function cleanObj(obj) {
  for (let key in obj) {
    if (obj.hasOwnProperty(key) && obj[key] === undefined) {
      delete obj[key];
    }
  }

  return obj;
}

// More reliable way then obj instanceof Promise
function isPromise(obj) { return Promise.resolve(obj) == obj }

function reqToRes(req, res) {
  if (res instanceof HttpResponse) {
    return res;
  }

  return (new HttpResponse(req)).clone({body: res});
}

// Without Injector
//
// import { HttpXhrBackend, XhrFactory } from '@angular/common/http';
// class BrowserXhr implements XhrFactory {
//   constructor() {}
//   build(): any { return <any>(new XMLHttpRequest()); }
// }
// const http = new HttpClient(new HttpXhrBackend(new BrowserXhr()));

interface IHttpConfig {
  body?: any;
  hasBody?: boolean;
  customType?: string; // Reserved for user options //new
  isArray?: boolean; // new
  mock?: (req: Request, httpConfig: IHttpConfig) => any; // new
  cache?: boolean | string; // new
  url?: string;
  host?: string;
  headers?: any;
  // observe?: any; // HttpObserve // Read more
  serializeBody?: any; // Read more
  detectContentTypeHeader?: any; // Read more
  clone?: any; // Read more
  observable?: boolean; // new
  params?: any;
  noTrailingSlash?: boolean;
  reportProgress?: boolean;
  responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
  transformRequest?: (request: Request, httpConfig: IHttpConfig) => any;
  transformResponse?: (response: any, httpConfig: IHttpConfig) => any;
  transformErrorResponse?: (errorResponse: HttpErrorResponse, httpConfig: IHttpConfig) => HttpErrorResponse | never | any; // Return undefined or NEVER to prevent this event
  withCredentials?: boolean;
}

const cache = new RequestCacheWithMap();

/*
  method: HttpMethod<IRequestParams, IResponseModel> = Get();
*/
export interface HttpMethod<RequestParams, ResponseModel> {
  (params?: RequestParams): Promise<ResponseModel>; // |Observable<ResponseModel>;
}

export interface HttpMethodRequest<Params> {
  (params?: Params): Promise<any>; // |Observable<any>;
}

export interface HttpMethodResponse<Model> {
  (params?: Model): Promise<any>; // |Observable<any>;
}

const ABSOLUTE_URL_REGEXP = new RegExp('^(?:[a-z]+:)?//', 'i');

const Request = (method: string, defaultHttpConfig: IHttpConfig = {}) => {
  method = method.toUpperCase();

  let defaultUrlTemplate;

  if (typeof defaultHttpConfig.url === 'string') {
    defaultUrlTemplate = new UrlTemplate(defaultHttpConfig.url);
  }

  return function doRequest(params?, httpConfig: IHttpConfig = {}) {
    httpConfig.headers = cleanObj(Object.assign({}, this._httpConfig.headers, defaultHttpConfig.headers));
    httpConfig.params  = Object.assign({}, this._httpConfig.params,  defaultHttpConfig.params);
    httpConfig = Object.assign({}, this._httpConfig, defaultHttpConfig, httpConfig);

    let body = httpConfig.body;

    if (!httpConfig.body && httpConfig.hasBody) {
      body = params;
      params = null;
    }

    params = cleanObj(Object.assign(httpConfig.params, params));

    const httpHeaders = Object.keys(httpConfig.headers).reduce(
        (curr, next) => curr.set(next, httpConfig.headers[next]),
        this._httpConfig.httpHeaders
      );

    const urlTemplate = defaultUrlTemplate || this._httpConfig.urlTemplate;
    let rawUrl = urlTemplate.createUrl(Object.assign({}, params, typeof body === 'object' ? body : null));

    if (this._httpConfig.noTrailingSlash) {
      rawUrl = rawUrl.replace(/\/$/, '');
    }

    const url = ABSOLUTE_URL_REGEXP.test(rawUrl) ? rawUrl : httpConfig.host + rawUrl;
    const queryParams = {};



    // Remove params which already included in the url placeholders
    // TODO Make way to resolve conflicts if we need to use placeholders and query variable with one name
    Object.keys(params).forEach(key => {
      if (!urlTemplate.placeholders.includes(key)) {
        queryParams[key] = params[key];
      }
    });

    const parameters: HttpParams = Object.keys(queryParams || {})
      .reduce(
        (curr, next) => curr.set(next, queryParams[next]),
        this._httpConfig.httpParams
      );

    const httpRequestInit = {
      headers: httpHeaders,
      // observe: httpConfig.observe,
      params: parameters,
      reportProgress: httpConfig.reportProgress,
      responseType: httpConfig.responseType,
      withCredentials: httpConfig.withCredentials
    };

    const resourceMethodName = Object.keys(this).find(methodName => this[methodName] === doRequest);

    this.actions.next({type: resourceMethodName + ':start', payload: body, error: null, meta: httpConfig});

    let mockRequest;
    const httpRequest = body ? new HttpRequest(method, url, body, httpRequestInit) : new HttpRequest(method, url, httpRequestInit);

    if (httpConfig.mock) {
      mockRequest = (req) => {
        const mockData = httpConfig.mock(req, httpConfig);
        console.warn(`Used mock for ${method.toUpperCase()} ${url}`, mockData);

        return isPromise(mockData) ? of(mockData.then(data => reqToRes(httpRequest, data))) : new Observable(observer => {
          setTimeout(() => {
            observer.next(reqToRes(httpRequest, mockData));
            observer.complete();
          }, 30); // Imitate minimum server delay
        });
      };
    }

    // DO REQUEST
    console.log(method, url, httpRequestInit);

    const requestObservable = (req) => {
      const cachedResponse = httpConfig.cache && cache.get(req, httpConfig.cache);

      if (cachedResponse) {
        return of(cachedResponse);
      }

      return mockRequest ? mockRequest(req) : this._http.request(req)
        .pipe(
          filter((event) => event instanceof HttpResponseBase),
          tap((response: HttpResponse<any>) => httpConfig.cache && cache.put(httpRequest, response, httpConfig.cache)),
        );
    };

    const transformedRequestObservable = requestObservable(httpRequest).pipe(
      map((response: HttpResponse<any>) => httpConfig.transformResponse(response.body, httpConfig)),
      catchError((response: HttpErrorResponse) => {
        const handledResponse = httpConfig.transformErrorResponse(response, httpConfig);

        if (handledResponse instanceof HttpErrorResponse) {
          return throwError(handledResponse);
        }

        if (handledResponse === undefined || handledResponse === NEVER) {
          return NEVER;
        }

        return of(handledResponse);
      }),
      tap(data => {
        this.actions.next({type: resourceMethodName, payload: data, error: null, meta: httpConfig});

      }, error => {
        this.actions.next({type: resourceMethodName, payload: null, error: error, meta: httpConfig});
      })
    );

    return httpConfig.observable ? transformedRequestObservable : transformedRequestObservable.toPromise();
  };
};

export function HttpConfig(options: IHttpConfig) {
  return function (target: Type<ReactiveResource>) {
    const original = target;

    // NOTE: If you see `Error: No provider for $SomeHttp$Resource!` it means that you need provider for Resource
    // which was extended from base Resource. You can add this to `providers` array of app.module
    const newConstructor: any = function $SomeHttp$Resource(...args) {
      const c: any = function childConstructor() {
        return original.apply(this, arguments);
        // console.log(333, original);
        // return new original(...arguments);
      };
      c.prototype = Object.create(original.prototype);
      const instance = new c(...args);

      // Set options
      const httpConfig = Object.assign({
        httpHeaders: new HttpHeaders(),
        httpParams: new HttpParams(),
        transformRequest: req => req,
        transformResponse: res => res,
        transformErrorResponse: res => res,
      }, instance._httpConfig, options);

      httpConfig.urlTemplate = new UrlTemplate(httpConfig.url);
      httpConfig.httpHeaders = Object.keys(httpConfig.headers || {}).reduce(
          (curr, next) => curr.set(next, httpConfig.headers[next]),
          httpConfig.httpHeaders
        );
      httpConfig.httpParams = Object.keys(httpConfig.params || {}).reduce(
          (curr, next) => curr.set(next, httpConfig.params[next]),
          httpConfig.httpParams
        );

      instance._httpConfig = httpConfig;
      instance._http = instance._injector.get(HttpClient);

      return instance;
    };

    newConstructor.prototype = Object.create(target.prototype);

    return newConstructor;
  };
}
// export const Get = (options?) => Request('get', options);

export function Get(options?: IHttpConfig) {
  return Request('get', options);
}

export function Post(options?: IHttpConfig) {
  return Request('post', Object.assign({hasBody: true}, options));
}

export function Patch(options?: IHttpConfig) {
  return Request('patch', Object.assign({hasBody: true}, options));
}

export function Put(options?: IHttpConfig) {
  return Request('put', Object.assign({hasBody: true}, options));
}

export function Delete(options?: IHttpConfig) {
  return Request('delete', options);
}

export function Head(options?: IHttpConfig) {
  return Request('head', options);
}

export function Jsonp(options?: IHttpConfig) {
  return Request('jsonp', options);
}

export function Options(options?: IHttpConfig) {
  return Request('options', options);
}


