import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

// Resources
import { CounterStore } from './_resources/counter.store';
import { UsersResource } from './_resources/users.resource';
import { ReposResource } from './_resources/repos.resource';
import { GithubApi } from './_resources/github-api';
import { AppComponent } from './app.component';
import { ChatResource } from './_resources/chat.resource';
import { GenerationResource } from './_resources/generation.resource';
import { PubSubResource } from './_resources/pubsub.resource';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [GithubApi, CounterStore, UsersResource, ReposResource, ChatResource, GenerationResource, PubSubResource],
  bootstrap: [AppComponent]
})
export class AppModule {}
