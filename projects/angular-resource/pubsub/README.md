# @angular-resource/pubsub
Publish-Subscriber wrapper of angular-resource

Wraps any Pub-Sub service to promise-like resource.
Your Pub-Sub-server should answer any message (except cases with timeout: 0)


```ts
@PubSubConfig({
  publish: (message?: Action) => {
    window.sendMessage(JSON.stringify(message)) // Send message to the non-http-server
  },
  subscriber: new Observable((subscriber: Subscriber<Action>) => {
    window.handleMessage = (message: string) => { // Receive message from the non-http-server
      subscriber.next(JSON.parse(message))
    }
  }),
  timeout: 10000 // 10s by default. If no confirmation - timeout error
})
export class PubSubResource extends ReactiveResource {
  requestWithoutConfirmation = Send({ timeout: 0 });
  request = Send();
}
```

See also: [angular-resource documentation](https://github.com/tamtakoe/oi-angular-resource)