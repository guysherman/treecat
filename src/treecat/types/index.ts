/* eslint-disable no-use-before-define */
export interface TreecatElement {
  type?: string | FC;
  props: {
    children?: TreecatElement[];
    [x: string]: any;
  }
}

export type TreecatNode = TreecatElement | TreecatElement[]
export type FC<T = Record<string, any>> = (props: T) => TreecatNode
