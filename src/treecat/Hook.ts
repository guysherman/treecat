export type Hook = {
  state: any;
  queue: ((...args: any[]) => any)[];
  deps?: any[];
}

