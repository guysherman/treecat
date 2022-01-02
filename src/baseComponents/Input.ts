import { PropUpdater } from './updateProps';
import { updatableProps as boxUpdatableProps } from './Box';

export const updatableProps: Record<string, PropUpdater> = {
  ...boxUpdatableProps,
};
