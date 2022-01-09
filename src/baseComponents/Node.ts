import { PropUpdater } from './updateProps';
import * as blessed from 'blessed';

export const updatableProps: Record<string, PropUpdater> = {};

export const noOp: PropUpdater = (_node: blessed.Widgets.Node, _value: unknown | undefined) => {
  return;
};
