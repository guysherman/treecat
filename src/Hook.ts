import { BaseReducer } from './types'

export type Hook = {
  state: any;
  reducer?: BaseReducer;
  deps?: any[];
}

