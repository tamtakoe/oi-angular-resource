import { Injectable } from '@angular/core';
import {GithubApi, HttpConfig, Get, Post, Put, Patch, Delete, WebSocketConfig, Close, Open, Send, HttpMethod} from './github-api';

interface GetUserReq {
  limit?: number
}
interface User {
  id: number;
  login: string;
}
@Injectable()
@HttpConfig({
  url: '/users/:id',
})
export class UsersResource extends GithubApi {
  override query: HttpMethod<GetUserReq, User[]> = Get({ isArray: true, cancelDuplicates: true });
}
