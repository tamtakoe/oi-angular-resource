import { Injectable } from '@angular/core';
import { GithubApi, HttpConfig, Get, Post, Put, Patch, Delete } from './github-api';

@Injectable()
@HttpConfig({
  url: '/users/:userId/repos/:id',
})
export class ReposResource extends GithubApi {}
