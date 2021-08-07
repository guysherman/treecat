import * as blessed from 'blessed'
import { Fiber } from './Fiber'

export type RendererContext = {
  nextUnitOfWork: Fiber | null;
  wipRoot: Fiber | null;
  wipFiber: Fiber | null;
  currentRoot: Fiber | null;
  blessedRoot: blessed.Widgets.Screen | null;
  deletions: Fiber[];
  shouldStopWorkloop: boolean;
  workLoopResolve: any;
}
