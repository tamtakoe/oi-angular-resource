import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AngularResourceModule } from '../../../angular-resource/core/src/lib/angular-resource.module';

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
    BrowserModule, AngularResourceModule
  ],
  providers: [UsersResource, ReposResource, GithubApi],
  bootstrap: [AppComponent]
})
export class AppModule { }
