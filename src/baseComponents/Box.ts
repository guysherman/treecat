/* eslint-disable @typescript-eslint/no-empty-function */
import { PropUpdater } from './updateProps';
import { updatableProps as elementProps } from './Element';

export const updatableProps: Record<string, PropUpdater> = {
  ...elementProps,
  keys: () => {},
  vi: () => {},
};
