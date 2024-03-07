import { Injectable } from '@angular/core';
import { Action, ReactiveResource } from '../../../../angular-resource/core/src/public-api';
import { PubSubConfig, Send } from '../../../../angular-resource/pubsub/src/public-api';
import { Observable, Subscriber } from 'rxjs';

const global = {
  send: (message: string) => {
    const request = JSON.parse(message)
    setTimeout(() => {
      const response = Object.assign(request, { payload: 'Response for ' + request.payload })
      global.on(JSON.stringify(response))
    }, 100)
  },
  on: (message: string) => {} // custom handler
}

@Injectable()
@PubSubConfig({
  publish: (message?: Action) => {
    console.log('Sended to Global', message);
    global.send && global.send(JSON.stringify(message))
  },
  subscriber: new Observable((subscriber: Subscriber<Action>) => {
    global.on = (message: string) => {
      console.log('Received from Global', message);
      subscriber.next(JSON.parse(message))
    }
  })
})
export class PubSubResource extends ReactiveResource {
  requestWithNoConfirmation = Send({ timeout: 0 });
  request = Send();
}