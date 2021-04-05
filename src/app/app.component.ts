import { Component } from '@angular/core';
import { UsersResource } from './_resources/users.resource';
import { ReposResource } from './_resources/repos.resource';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  users: any[] = [];
  repos: any[] = [];

  constructor(private usersResource: UsersResource, private reposResource: ReposResource) {
    this.loadUsers();
  }

  loadUsers() {
    this.usersResource.query().then((users: any[]) => {
      this.users = users;
    });
  }

  showRepos(userId: any) {
    this.reposResource.query({userId}).then((repos: any[]) => {
      this.repos = repos;
    });
  }
}
