import { Component } from '@angular/core';
import { CounterStore } from './_resources/counter.store';
import { UsersResource } from './_resources/users.resource';
import { ReposResource } from './_resources/repos.resource';
import { GithubApi } from './_resources/github-api';
import { ChatResource } from './_resources/chat.resource';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Angular resource demo';
  users: any[] = [];
  repos: any[] = [];
  messages: any[] = [];
  isLoading = false;
  isError = false;
  counter = 0
  updatedAt = 0

  constructor(
    private githubApi: GithubApi,
    private counterStore: CounterStore, 
    private usersResource: UsersResource, 
    private reposResource: ReposResource,
    private chatResource: ChatResource
    ) {

    // Effects
    this.counterStore.action('increase', 'decrease')
    .subscribe(payload => {
      this.counterStore.updateAt(Date.now());
    });
    
    // Subscriptions
    this.counterStore.state.subscribe(state => {
      console.log('state', state)
      this.counter = state.counter;
      this.updatedAt = state.updatedAt
      // this.counterStore.updateAt(Date.now());
    });

    this.githubApi.actions.subscribe({
      next: (data) => {
        console.log('githubApi data', data);
      },
      complete: () => {
        console.log('githubApi complete');
      },
      error: (error) => {
        console.log('githubApi error', error);
      }
    })

    this.usersResource.actions.subscribe({
      next: (data) => {
        console.log('usersResource data', data);
      },
      error: (error) => {
        console.log('usersResource error', error);
      }
    })

    // Chat in event driven style
    // this.chatResource.getMessages()
    //   .then((messages: any[]) => {
    //     this.messages = messages;
    //   })
    //   .catch((error: any) => {
    //     console.log('HTTP server error', error)
    //   })
      
    // this.chatResource.connect()
    //   .catch(error => {
    //     console.log('WS server error', error);
    //   })

    // this.chatResource.action('newMessage')
    //   .subscribe(message => {
    //     this.messages.push(message)
    //   })

    // Chat in redux style
    this.chatResource.state.subscribe(state => {
      this.messages = state.messages;
      this.isLoading = state.isLoading;
      this.isError = state.isError;
    });
    this.chatResource.getMessages()
    this.chatResource.connect()
  }

  // Redux
  increase(num: number) {
    this.counterStore.increase(num);
  }

  decrease(num: number) {
    this.counterStore.decrease(num);
  }

  // HTTP
  loadUsers() {
    // this.githubApi.getUsers().then((users: any[]) => {
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

  startServerStream() {
    this.githubApi.sendSocketIo('startServerStream')
    .then(() => console.log('Server stream was started. Now we are getting of broadcast and regular events'))
    .catch(error => console.log('Error', error));
  }

  stopServerStream() {
    this.githubApi.sendSocketIo('stopServerStream')
    .then(() => console.log('Server stream was stopped'))
    .catch(error => console.log('Error', error));
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

  // Chat
  sendMessage() {
    this.chatResource.sendMessage({text: `Message ${(new Date()).toUTCString()}`}).then(d => {
      console.log(`Message was sended by Socket.IO`, d);
    });
  }
}
