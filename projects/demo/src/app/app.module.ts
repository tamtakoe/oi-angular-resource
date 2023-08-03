import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

// Resources
import { UsersResource } from './_resources/users.resource';
import { ReposResource } from './_resources/repos.resource';
import { CounterStore } from './_resources/counter.store';
import { ChatResource } from './_resources/chat.resource';
import { GithubApi } from './_resources/github-api';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [GithubApi, CounterStore, UsersResource, ReposResource, ChatResource],
  bootstrap: [AppComponent]
})
export class AppModule { }
