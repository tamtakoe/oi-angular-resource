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

See also: [angular-resource documentation](https://github.com/tamtakoe/oi-angular-resource)
