import { PropUpdater } from './updateProps';
import { updatableProps as inputUpdatableProps } from './Input';

export const updatableProps: Record<string, PropUpdater> = {
  ...inputUpdatableProps,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  readOnFocus: () => {},
};
