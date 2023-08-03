import { Injectable } from '@angular/core';
import {StateConfig, ReactiveResource} from './github-api';

@Injectable()
@StateConfig({
  initialState: {
    counter: 0,
    updatedAt: 0
  },
  updateState: (state, action) => { 
    // Reducer
    if (action.error) {
      return state;
    }
    switch (action.type) {
      case 'increase':
        return {...state, counter: state.counter + action.payload};

      case 'decrease':
        return {...state, counter: state.counter - action.payload};

      case 'updateAt':
        return {...state, updatedAt: action.payload};

      default:
        return state;
    }
  }
})
export class CounterStore extends ReactiveResource {
  // Actions
  increase = (num: number) => this.action('increase').next(num);
  decrease = (num: number) => this.action('decrease').next(num);
  updateAt = (num: number) => this.action('updateAt').next(num);

  // or this way if you want to incapsulate simple logic like current date, hash etc. inside the action
  //increase = (num: number) => { this.action('updateAt').next(Date.now()); this.action('increase').next(num); }
}
