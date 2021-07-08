import * as blessed from 'blessed'

export type Fiber = {
  dom?: blessed.Widgets.Node | null;
  type?: string;
  props?: any & { children: Fiber[] };
  parent: Fiber | null;
  child: Fiber | null;
  sibling: Fiber | null;
}

