import { Injectable } from '@angular/core';
import {GithubApi, HttpConfig, Get, Post, Put, Patch, Delete, WebSocketConfig, Close, Open, Send} from './github-api';

@Injectable()
@HttpConfig({
  url: '/users/:id',
})
export class UsersResource extends GithubApi {
  override query = Get({ isArray: true, cancelDuplicates: true });
}
