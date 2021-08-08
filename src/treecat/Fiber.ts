import * as blessed from 'blessed'
import { ElementDescription } from './ElementDescription'
import { Hook } from './Hook'

export type Fiber = ElementDescription & {
  hookIndex?: number;
  dom?: blessed.Widgets.Node;
  parent?: Fiber;
  child?: Fiber;
  sibling?: Fiber;
  alternate?: Fiber | null;
  effectTag?: string;
  hooks?: Hook[];
  effects?: (() => (() => void) | void)[];
  effectCleanups?: (() => void)[];
}

