import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { AngularResourceModule } from 'angular-resource';
import {UsersResource} from './_resources/users.resource';
import {ReposResource} from './_resources/repos.resource';
import {GithubApi} from './_resources/github-api';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AngularResourceModule
      ],
      providers: [
        GithubApi,
        UsersResource,
        ReposResource
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
