import { Injectable } from '@angular/core';
import { environment as config } from '../../environments/environment';
import { ReactiveResource } from '../../../../angular-resource/core/src/public-api';
import { HttpConfig, Get, Post } from '../../../../angular-resource/http/src/public-api';
import { ProgressConfig, Progress } from '../../../../angular-resource/progress/src/public-api';

@Injectable()
@HttpConfig({
  host: config.resources.chat.httpHost,
  url: '/generation/:processId',
})
@ProgressConfig({
  interval: 1000, // 10s by default. How often check progress
  timeout: 10 * 60 * 1000, // 10m by default. How long to wait for the process to complete
})
export class GenerationResource extends ReactiveResource {
    startGeneration = Post(); // Returns initData
    getGenerationStatus = Get();

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