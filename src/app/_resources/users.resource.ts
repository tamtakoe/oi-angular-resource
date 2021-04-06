import { Injectable } from '@angular/core';
import { GithubApi, HttpConfig, Get, Post, Put, Patch, Delete } from './github-api';

@Injectable()
@HttpConfig({
  url: '/users/:id',
})
export class UsersResource extends GithubApi {
  query = Get({ isArray: true, cancelDuplicates: true });
}
