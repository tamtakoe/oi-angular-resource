import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

// Resources
import { CounterStore } from './_resources/counter.store';
import { UsersResource } from './_resources/users.resource';
import { ReposResource } from './_resources/repos.resource';
import { GithubApi } from './_resources/github-api';

import { AppComponent } from './app.component';
import { ChatResource } from './_resources/chat.resource';

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
export class AppModule {}
