import { Injectable } from '@angular/core';
import {ApiResource, HttpConfig, Get, Post, Put, Patch, Delete, WebSocketConfig, Close, Open, Send} from './api';

@Injectable()
@HttpConfig({
  url: '/users/:id',
})
export class UsersResource extends ApiResource {
  override query = Get({ isArray: true, cancelDuplicates: true });
}
