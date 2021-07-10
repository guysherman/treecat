import * as blessed from 'blessed'
import { ElementDescription } from './ElementDescription'

export type Fiber = ElementDescription & {
  dom?: blessed.Widgets.Node;
  parent?: Fiber;
  child?: Fiber;
  sibling?: Fiber;
  alternate?: Fiber | null;
  effectTag?: string;
}

