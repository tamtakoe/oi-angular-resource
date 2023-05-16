import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpResourceModule } from '@angular-resource/http';

// Resources
import { UsersResource } from './_resources/users.resource';
import { ReposResource } from './_resources/repos.resource';
import { GithubApi } from './_resources/github-api';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule, HttpResourceModule
  ],
  providers: [UsersResource, ReposResource, GithubApi],
  bootstrap: [AppComponent]
})
export class AppModule { }
