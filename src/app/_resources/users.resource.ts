import { Injectable } from '@angular/core';
import {GithubApi, HttpConfig, Get, Post, Put, Patch, Delete, WebSocketConfig, Close, Open, Send} from './github-api';

@Injectable()
// @WebSocketConfig({
//   url: 'wss://0.0.0.0:9000',
//   protocols: []
// })
@HttpConfig({
  url: '/users/:id',
})
export class UsersResource extends GithubApi {
  query = Get({ isArray: true, cancelDuplicates: true });
}
