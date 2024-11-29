import { Injectable } from '@angular/core';
import {ApiResource, HttpConfig, Get, Post, Put, Patch, Delete, WebSocketConfig, Close, Open, Send, HttpMethod} from './api';

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
  withCredentials: true
})
export class UsersResource extends ApiResource {
  override query: HttpMethod<GetUserReq, User[]> = Get({ isArray: true, cancelDuplicates: true });
}
