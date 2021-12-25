/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-use-before-define */
export interface TreecatElement {
  type?: any;
  props: {
    children?: TreecatElement[];
    [x: string]: any;
  };
}

export type TreecatNode = TreecatElement | TreecatElement[];

export interface FC<T = any> {
  (props: T): ContextElement | TreecatNode;
}

export interface ContextProviderProps<T> {
  value: T;
  children: TreecatNode;
}
export interface Context<T = any> {
  defaultValue: T;
  Provider: FC<ContextProviderProps<T>>;
}

export interface ContextElement {
  value: any;
  context: Context<any>;
  children: TreecatNode;
}
export interface TypedContextElement<T = any> extends ContextElement {
  value: T;
  context: Context<T>;
  children: TreecatNode;
}

export interface BaseReducer {
  (state: any, action: any): any;
}

export interface Reducer<T> extends BaseReducer {
  (state: any, action: any): any;
  (state: T, action: any): T;
}
