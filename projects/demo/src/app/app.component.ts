import { Component } from '@angular/core';
import { UsersResource } from './_resources/users.resource';
import { ReposResource } from './_resources/repos.resource';
import { GithubApi } from './_resources/github-api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Angular resource demo';
  users: any[] = [];
  repos: any[] = [];

  constructor(private usersResource: UsersResource, private reposResource: ReposResource, private githubApi: GithubApi) {

    // Events
    this.githubApi.actions.subscribe({
      next: (data) => {
        console.log('githubApi:data', data);
      },
      complete: () => {
        console.log('githubApi:complete');
      },
      error: (error) => {
        console.log('githubApi:error', error);
      }
    })

    //
    this.usersResource.actions.subscribe({
      next: (data) => {
        console.log('usersResource:data', data);
      },
      error: (error) => {
        console.log('usersResource:error', error);
      }
    })
  }

  // HTTP
  loadUsers() {
    this.usersResource.query().then((users: any[]) => {
      this.users = users;
      console.log('USERS', users);
    });
  }

  showRepos(userId: any) {
    this.reposResource.query({userId}).then((repos: any[]) => {
      this.repos = repos;
    });
  }

  // Local storage
  loadFromLocalStorage() {
    const data = this.githubApi.loadFromLocalStorage();
    console.log('LOADED from LS', data);
  };
  saveToLocalStorage() {
    const data = Math.random();
    this.githubApi.saveToLocalStorage(data);
    console.log('SAVED from LS', data);
  };
  removeFromLocalStorage() {
    this.githubApi.removeFromLocalStorage();
    console.log('REMOVED from LS');
  };

  // Websocket
  openWs() {
    console.log('OPEN WS');
    this.githubApi.open().then(d => {
      console.log('OPEN WS ANSWER', d);
    });
  }

  sendWs() {
    const data = { action: 'ECHO', data: Math.random()};
    console.log('SEND WS', data);
    this.githubApi.send(JSON.stringify(data)).then(d => {
      console.log('SEND WS ANSWER', d);
    });
  }

  closeWs() {
    console.log('CLOSE WS');
    this.githubApi.close().then(d => {
      console.log('CLOSE WS ANSWER', d);
    });
  }

  // Socket.IO
  openSocketIo() {
    console.log('OPEN Socket.IO');
    this.githubApi.openSocketIo().then(d => {
      console.log('OPEN Socket.IO ANSWER', d);
    });
  }

  sendSocketIo() {
    const data = { action: 'ECHO', data: Math.random()};
    console.log('SEND Socket.IO', data);

    this.githubApi.sendSocketIo('socketIoTest', JSON.stringify(data)).then(d => {
      console.log('SEND Socket.IO ANSWER', d);
    });

    this.githubApi.sendSocketIoEvent(JSON.stringify(data)).then(d => {
      console.log('SEND Socket.IO ANSWER', d);
    });
  }

  closeSocketIo() {
    console.log('CLOSE Socket.IO');
    this.githubApi.closeSocketIo().then(d => {
      console.log('CLOSE Socket.IO ANSWER', d);
    });
  }
}
