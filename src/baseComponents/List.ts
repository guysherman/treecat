import { PropUpdater } from './updateProps';
import * as blessed from 'blessed';
import { updatableProps as boxProps } from './Box';

export const updatableProps: Record<string, PropUpdater> = {
  ...boxProps,
  selected: (list, value) => {
    if (value !== undefined) {
      (list as blessed.Widgets.ListElement).select(value as number);
    } else {
      (list as blessed.Widgets.ListElement).select(0);
    }
  },
  items: (list, value) => {
    if (value !== undefined) {
      (list as blessed.Widgets.ListElement).clearItems();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (list as blessed.Widgets.ListElement).setItems(value as any);
    } else {
      (list as blessed.Widgets.ListElement).setItems([]);
    }
  },
};
