import * as blessed from 'blessed';
import { Fiber } from './Fiber';

export type RendererContext = {
  nextUnitOfWork: Fiber | null;
  wipRoot: Fiber | null;
  wipFiber: Fiber | null;
  currentRoot: Fiber | null;
  blessedRoot: blessed.Widgets.Screen | null;
  deletions: Fiber[];
  shouldStopWorkloop: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  workLoopResolve: ((value: void | PromiseLike<void>) => void) | null;
};
