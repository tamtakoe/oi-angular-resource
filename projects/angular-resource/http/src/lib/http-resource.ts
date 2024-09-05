import { Type } from '@angular/core';
import { XhrFactory } from '@angular/common';
import { HttpClient, HttpHeaders, HttpParams, HttpRequest, HttpResponse, HttpErrorResponse, HttpXhrBackend } from '@angular/common/http';
import { UrlTemplate } from './url-template';
import { RequestCacheWithMap } from './request-cache';
import { Observable, of, throwError, NEVER, Subject} from 'rxjs';
import { map, tap, filter, catchError, takeUntil } from 'rxjs/operators';
import { XMLHttpRequest as xmlhttpreq } from 'xhr2'; // 'w3c-xmlhttprequest' 'xmlhttprequest-ts'

declare var global: any;
declare var window: any;

function cleanObj(obj: any) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key) && obj[key] === undefined) {
      delete obj[key];
    }
  }

  return obj;
}

// More reliable way then obj instanceof Promise
function isPromise(obj: any) {
  return Promise.resolve(obj) === obj;
}

function reqToRes(req: any, res: any) {
  if (res instanceof HttpResponse) {
    return res;
  }

  return (new HttpResponse(req)).clone({body: res});
}

// Without Injector
class BrowserXhr implements XhrFactory {
  constructor() {}
  build(): any {
    let XmlHttpRequest: any 

    if (typeof XMLHttpRequest !== 'undefined') {
      XmlHttpRequest = XMLHttpRequest

    } else if (typeof window !== 'undefined' && window.XMLHttpRequest) {
      XmlHttpRequest = window.XMLHttpRequest

    } else if (typeof global !== 'undefined' && global.XMLHttpRequest) {
      XmlHttpRequest = global.XMLHttpRequest
    } else {
      XmlHttpRequest = xmlhttpreq
    }
    return (new XmlHttpRequest()) as any;
  }
}
const http = new HttpClient(new HttpXhrBackend(new BrowserXhr()));

// Get Injector from module https://stackoverflow.com/a/49508355/2422244
// export let InjectorInstance: Injector;
//
// @NgModule(...)
// export class AngularResourceModule {
//   constructor(private injector: Injector) {
//     InjectorInstance = this.injector;
//   }
// }
// const http = new HttpClient(new HttpXhrBackend(new BrowserXhr()));

interface IHttpConfig {
  body?: any; // Request body
  hasBody?: boolean;
  customType?: string; // Reserved for user options //new
  isArray?: boolean; // new
  mock?: (req: Request, httpConfig: IHttpConfig) => any; // new
  cache?: boolean | string; // new // Cache response //TODO implement ttl
  url?: string;
  host?: string;
  headers?: { [key: string]: string | string[] }; // Headers
  // observe?: any; // HttpObserve // Read more
  serializeBody?: any; // Read more
  detectContentTypeHeader?: any; // Read more
  clone?: any; // Read more
  observable?: boolean; // new // Response is Observable
  params?: any; // Query params or template params or body
  noTrailingSlash?: boolean;
  reportProgress?: boolean;
  responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
  transformRequest?: (request: Request, httpConfig: IHttpConfig) => any;
  transformResponse?: (response: any, httpConfig: IHttpConfig) => any;
  transformErrorResponse?: (errorResponse: HttpErrorResponse, httpConfig: IHttpConfig) =>
    HttpErrorResponse | never | any; // Return undefined or NEVER to prevent this event
  withCredentials?: boolean;
  cancelDuplicates?: boolean; // Cancel previous duplicate requests
}

const cache = new RequestCacheWithMap();

/*
  method: HttpMethod<IRequestParams, IResponseModel> = Get();
*/
export type HttpMethod<RequestParams, ResponseModel> = (params?: RequestParams) => Promise<ResponseModel>;

export type HttpMethodRequest<Params> = (params?: Params) => Promise<any>;

export type HttpMethodResponse<Model> = (params?: Model) => Promise<any>;

const ABSOLUTE_URL_REGEXP = new RegExp('^(?:[a-z]+:)?//', 'i');
const requestQueue = new Map();

const Request = (method: string, defaultHttpConfig: IHttpConfig = {}) => {
  method = method.toUpperCase();

  let defaultUrlTemplate: UrlTemplate;

  if (typeof defaultHttpConfig.url === 'string') {
    defaultUrlTemplate = new UrlTemplate(defaultHttpConfig.url);
  }

  return function doRequest(this: any, params?: any, httpConfig: IHttpConfig = {}) {
    const headers = httpConfig.headers =
      cleanObj(Object.assign({}, this.$httpConfig.headers, defaultHttpConfig.headers, httpConfig.headers));

    httpConfig.params = Object.assign({}, this.$httpConfig.params,  defaultHttpConfig.params);
    httpConfig = Object.assign({}, this.$httpConfig, defaultHttpConfig, httpConfig);

    let body = httpConfig.body;

    if (!httpConfig.body && httpConfig.hasBody) {
      body = params;
      params = null;
    }

    params = cleanObj(Object.assign(httpConfig.params, params));

    const urlTemplate = defaultUrlTemplate || this.$httpConfig.urlTemplate;
    let rawUrl = urlTemplate.createUrl(Object.assign({}, params, typeof body === 'object' ? body : null));

    if (this.$httpConfig.noTrailingSlash) {
      rawUrl = rawUrl.replace(/\/$/, '');
    }

    const url = ABSOLUTE_URL_REGEXP.test(rawUrl) ? rawUrl : httpConfig.host + rawUrl;

    const requestId = [method, url, JSON.stringify(headers), JSON.stringify(body)].join('&');

    const httpHeaders = Object.keys(headers).reduce(
      (curr, next) => curr.set(next, headers[next]),
      this.$httpConfig.httpHeaders
    );

    const queryParams: any = {};

    // Remove params which already included in the url placeholders
    // TODO Make way to resolve conflicts if we need to use placeholders and query variable with one name
    Object.keys(params).forEach((key: string) => {
      if (!urlTemplate.placeholders.includes(key)) {
        queryParams[key] = params[key];
      }
    });

    const parameters: HttpParams = Object.keys(queryParams || {})
      .reduce(
        (curr, next) => curr.set(next, queryParams[next]),
        this.$httpConfig.httpParams
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

    const cancelRequest = (reqId: string) => {
      const unsubscribeStream = requestQueue.get(reqId);

      if (unsubscribeStream) {
        unsubscribeStream.next();
        unsubscribeStream.complete();
        this.actions.next({type: resourceMethodName + ':cancel', payload: body, error: null, meta: httpConfig});
      }
    };

    this.actions.next({type: resourceMethodName + ':start', payload: body, error: null, meta: httpConfig});

    let mockRequest: any;
    const httpRequest = body ? new HttpRequest(method, url, body, httpRequestInit) : new HttpRequest(method, url, httpRequestInit);

    if (httpConfig.mock) {
      mockRequest = (req: any) => {
        const mockData = httpConfig.mock && httpConfig.mock(req, httpConfig);
        console.warn(`Used mock for ${method.toUpperCase()} ${url}`, mockData);

        return isPromise(mockData) ? of(mockData.then((data: any) => reqToRes(httpRequest, data))) : new Observable(observer => {
          setTimeout(() => {
            observer.next(reqToRes(httpRequest, mockData));
            observer.complete();
          }, 30); // Imitate minimum server delay
        });
      };
    }

    // Internal request wrapper
    const requestObservable = (req: HttpRequest<any>) => {
      const cachedResponse = httpConfig.cache && cache.get(req, httpConfig.cache);

      if (cachedResponse) {
        return of(cachedResponse);
      }

      // Any event in cancelStream will cancel this request
      const cancelStream = new Subject();

      if (httpConfig.cancelDuplicates) {
        cancelRequest(requestId);
        requestQueue.set(requestId, cancelStream);
      }

      return mockRequest ? mockRequest(req) : http.request(req)
        .pipe(
          takeUntil(cancelStream),
          filter((event: any) => event instanceof HttpResponse),
          tap((response: HttpResponse<any>) => httpConfig.cache && cache.put(httpRequest, response, httpConfig.cache))
        );
    };

    // Do request
    const transformedRequestObservable = requestObservable(httpRequest).pipe(
      map((response: HttpResponse<any>) => httpConfig.transformResponse && httpConfig.transformResponse(response.body, httpConfig)),
      catchError((response: HttpErrorResponse) => {

        const handledResponse = httpConfig.transformErrorResponse && httpConfig.transformErrorResponse(response, httpConfig);

        if (handledResponse instanceof HttpErrorResponse) {
          return throwError(() => handledResponse);
        }

        if (handledResponse === undefined || handledResponse === NEVER) {
          return NEVER;
        }

        return of(handledResponse);
      }),
      tap(
        {
          next: (data) => {
            requestQueue.delete(requestId);
            this.actions.next({ type: resourceMethodName, payload: data, error: null, meta: httpConfig });
          },
          error: (error) => {
            requestQueue.delete(requestId);
            this.actions.next({ type: resourceMethodName, payload: null, error, meta: httpConfig });
          }
        })
    );

    return httpConfig.observable ? transformedRequestObservable : transformedRequestObservable.toPromise();
  };
};

export function HttpConfig(options: IHttpConfig) {
  return (target: Type<void>) => {
    const original = target;

    // NOTE: If you see `Error: No provider for $SomeHttp$Resource!` it means that you need provider for Resource
    // which was extended from base Resource. You can add this to `providers` array of app.module
    const newConstructor: any = function $SomeHttp$Resource(...args: any[]) {
      const c: any = function childConstructor(...args2: any[]) {
        return new original(...args2);
      };
      c.prototype = Object.create(original.prototype);
      const instance = new c(...args);

      // Set options
      const httpConfig = Object.assign({
        url: '',
        httpHeaders: new HttpHeaders(),
        httpParams: new HttpParams(),
        transformRequest: (req: any) => req,
        transformResponse: (res: any) => res,
        transformErrorResponse: (res: any) => res,
      }, instance.$httpConfig, options);

      httpConfig.urlTemplate = new UrlTemplate(httpConfig.url);
      httpConfig.httpHeaders = Object.keys(httpConfig.headers || {}).reduce(
          (curr, next) => curr.set(next, httpConfig.headers[next]),
          httpConfig.httpHeaders
        );
      httpConfig.httpParams = Object.keys(httpConfig.params || {}).reduce(
          (curr, next) => curr.set(next, httpConfig.params[next]),
          httpConfig.httpParams
        );

      instance.$httpConfig = httpConfig;

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


