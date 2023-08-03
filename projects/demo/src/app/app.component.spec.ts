import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { createMockClass, GithubApi } from './_resources/github-api';
import { UsersResource } from './_resources/users.resource';
import { ReposResource } from './_resources/repos.resource';
import { CounterStore } from './_resources/counter.store';
import { ChatResource } from './_resources/chat.resource';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        { provide: GithubApi, useClass: createMockClass(GithubApi) },
        { provide: UsersResource, useClass: createMockClass(UsersResource) },
        { provide: ReposResource, useClass: createMockClass(ReposResource) },
        { provide: ChatResource, useClass: createMockClass(ChatResource) },
        { provide: CounterStore, useClass: createMockClass(CounterStore) }
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
