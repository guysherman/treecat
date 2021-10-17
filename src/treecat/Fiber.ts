import * as blessed from 'blessed'
import { TreecatElement } from './types/TreecatElement'
import { Hook } from './Hook'

export type Fiber = TreecatElement & {
  hookIndex?: number;
  dom?: blessed.Widgets.Node;
  parent?: Fiber;
  child?: Fiber;
  sibling?: Fiber;
  alternate?: Fiber | null;
  effectTag?: string;
  hooks?: Hook[];
  effects: (() => (() => void) | void)[];
  effectCleanups: (() => void)[];
}

