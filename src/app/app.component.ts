import { Component } from '@angular/core';
import { UsersResource } from './_resources/users.resource';
import { ReposResource } from './_resources/repos.resource';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  users = [];
  repos = [];

  constructor(private usersResource: UsersResource, private reposResource: ReposResource) {
    this.loadUsers();
  }

  loadUsers() {
    this.usersResource.query().then(users => {
      this.users = users;
    });
  }

  showRepos(userId) {
    this.reposResource.query({userId: userId}).then(repos => {
      this.repos = repos;
    });
  }
}
