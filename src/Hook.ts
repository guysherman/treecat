/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseReducer } from './types';

export type Hook = {
  state: any;
  reducer?: BaseReducer;
  deps?: any[];
};
