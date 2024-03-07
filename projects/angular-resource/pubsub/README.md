# @angular-resource/pubsub
Publish-Subscriber wrapper of angular-resource

Wraps any Pub-Sub service to promise-like resource.
Your Pub-Sub service should answer any message (except cases with timeout: 0)


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

### PubSubConfig
- `publish` _(data?: Action) => void_ - Send message to Pub-Sub service
- `subscriber` _Observable<Action>_ - Handle events from Pub-Sub service
- `timeout` _number_ (default: 10000) - Max request duration in ms
- `autoConnect` _boolean_ (default: true) - Connect to Pub-Sub service when application starts
- `mock` _any | () => any_ - Returns the value instead of real request
- `observable` _boolean_ (default: false) - Return Observable or Promise

### Send
- `Send(config?: PubSubConfig)` returns _(payload: any) => Promise | Observable_ - Create send method


See also: [angular-resource documentation](https://github.com/tamtakoe/oi-angular-resource)