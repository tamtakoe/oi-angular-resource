import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { UsersResource } from './_resources/users.resource';
import { ReposResource } from './_resources/repos.resource';
import { GithubApi } from './_resources/github-api';
import { ChatResource } from './_resources/chat.resource';
import { CounterStore } from './_resources/counter.store';
import { GenerationResource } from './_resources/generation.resource';
import { PubSubResource } from './_resources/pubsub.resource';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        GithubApi,
        UsersResource,
        ReposResource,
        ChatResource,
        CounterStore,
        GenerationResource,
        PubSubResource
      ],
      declarations: [
        AppComponent
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'Angular resource demo'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('Angular resource demo');
  });
});
