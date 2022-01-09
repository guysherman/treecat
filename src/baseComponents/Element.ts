import { PropUpdater } from './updateProps';
import * as blessed from 'blessed';
import { noOp, updatableProps as nodeProps } from './Node';

export const updatableProps: Record<string, PropUpdater> = {
  ...nodeProps,
  left: (node, value) =>
    ((node as blessed.Widgets.BlessedElement).left = (value as blessed.Widgets.Types.TPosition) ?? 0),
  right: (node, value) =>
    ((node as blessed.Widgets.BlessedElement).right = (value as blessed.Widgets.Types.TPosition) ?? 0),
  top: (node, value) =>
    ((node as blessed.Widgets.BlessedElement).top = (value as blessed.Widgets.Types.TPosition) ?? 0),
  bottom: (node, value) =>
    ((node as blessed.Widgets.BlessedElement).bottom = (value as blessed.Widgets.Types.TPosition) ?? 0),
  width: (node, value) => ((node as blessed.Widgets.BlessedElement).width = (value as string | number) ?? 0),
  height: (node, value) => ((node as blessed.Widgets.BlessedElement).height = (value as string | number) ?? 0),
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  tags: () => {},
  border: (node, value) => noOp(node, value),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //((node as blessed.Widgets.BlessedElement).border = (value as any) ?? { type: 'line' as const }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  style: (node, value) => ((node as blessed.Widgets.BlessedElement).style = (value as any) ?? {}),
  label: (node, value) => {
    if (value) {
      (node as blessed.Widgets.BlessedElement).setLabel(value as string | blessed.Widgets.LabelOptions);
    } else {
      (node as blessed.Widgets.BlessedElement).removeLabel();
    }
  },
  focused: (node, value) => {
    if (value) {
      (node as blessed.Widgets.BlessedElement).focus();
    }
  },
};
