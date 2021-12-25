import * as blessed from 'blessed';
import { ContextElement, TreecatElement } from './types';
import { Hook } from './Hook';

export interface Fiber extends TreecatElement {
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
  contextProviders?: ContextElement[];
}
