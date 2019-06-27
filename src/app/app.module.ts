import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AngularResourceModule } from '../../projects/angular-resource/src/lib/angular-resource.module';

// Resources
import { UsersResource } from './_resources/users.resource';
import { ReposResource } from './_resources/repos.resource';

import { AppComponent } from './app.component';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule, AngularResourceModule
  ],
  providers: [UsersResource, ReposResource],
  bootstrap: [AppComponent]
})
export class AppModule { }
