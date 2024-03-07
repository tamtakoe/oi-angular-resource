# @angular-resource/progress
Progress-checking-adapter of angular-resource

Combine checking progress requests to make one endpoint

```ts
// Resource
@HttpConfig({
  host: 'https://generator-example.net/api',
})
@ProgressConfig({
  interval: 10 * 1000, // 10s by default. How often check progress
  timeout: 10 * 60 * 1000, // 10m by default. How long to wait for the process to complete
})
export class ApiResource extends ReactiveResource {
    startGeneration = Post({ url: '/ai/generation' }); // Returns initData
    getGenerationStatus = Get({ url: '/ai/generation/:processId' });

    generate = Progress({ 
        init: this.startGeneration, // Initial request
        check: (checking: any) => { // Do checking requests every interval period
            this.getGenerationStatus({ processId: checking.initData.id }).then((data: any) => {
                switch (data.status) {
                case 'success':
                    checking.complete(data);
                    break;
                case 'error':
                    checking.error(data);
                    break;
                default: // pending 
                    // You can use e.g.
                    // data.progress = checking.getProgress()
                    // to get fake progress
                    checking.next(data);
                }
            })
        }
    });
}
```

```ts
// Component etc.
export class GenerationComponent {
   constructor (private apiResource: ApiResource) {}

    startGeneration() {
        this.isLoading = true;
        this.progress = 0;

        this.apiResource.action('generate:progress').subscribe((data: any) => {
            this.progress = data.progress
        })
        this.apiResource.generate().then((data: any) => {
            this.result = data.result;
            this.progress = 100;
            this.isLoading = false;

        }).catch((error: any) => {
            this.isLoading = false;
        })
  }
}
```

### ProgressConfig
- `init` _(data?: any) => Promise<any>_ - HTTP-request function
- `check` _(checking: Checking) => any_ - Function to run checking HTTP-request
- `fakeProgressFn` _(x: number) => number_ (default: easyOut) - Function to generate fake progress
- `interval` _number_ (default: 10000) - How often to check status in ms
- `timeout` _number_ (default: 600000) - How long to check status
- `observable` _boolean_ (default: false) - Return Observable or Promise

### Checking
- `initData` _any_ - Responce of initial request
- `next` _(data: any) => void_ - Execute if process is in progress
- `complete` _(data: any) => void_ - Execute if process is completed
- `error` _(error: any) => void_ - Execute if an error during the process
- `getProgress` _(format: string) => number_ (default: format='xx.xx' (e.g. 15.03%)) - Get fake progress of process

### Progress
- `Progress(config: ProgressConfig)` returns _(payload: any) => Promise | Observable_ - Create progress method

See also: [angular-resource documentation](https://github.com/tamtakoe/oi-angular-resource)
