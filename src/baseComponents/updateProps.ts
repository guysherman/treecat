import * as blessed from 'blessed';
import { Fiber } from '../Fiber';
import { updatableProps as listUpdatableProps } from './List';

export const eventPrefix = 'on';
export const keyEventPrefix = 'keyon';

export type Entry = [string, unknown];
export type PropUpdater = (node: blessed.Widgets.Node, value: unknown | undefined) => void;

export function isEvent(propName: string) {
  return propName.startsWith(eventPrefix);
}

export function isKeyEvent(propName: string) {
  return propName.startsWith(keyEventPrefix);
}

export function isProp(propName: string) {
  return propName !== 'children' && !isEvent(propName) && !isKeyEvent(propName);
}

export function isChanged(newEntry: Entry, oldEntry: Entry): boolean {
  const newValue = newEntry[1];
  const oldValue = oldEntry[1];

  return JSON.stringify(newValue) !== JSON.stringify(oldValue);
}

export const getEvents = (props: Record<string, unknown>) => Object.entries(props).filter(([key]) => isEvent(key));
export const getProps = (props: Record<string, unknown>) => Object.entries(props).filter(([key]) => isProp(key));

const propUpdaters: Record<string, Record<string, PropUpdater>> = {
  list: listUpdatableProps,
};

export function updateProps(fiber: Fiber): boolean {
  if (fiber?.alternate?.dom && fiber.dom) {
    if (!isUpdatable(fiber)) {
      return false;
    }
    // We want to update the old one, so we carry it forward into this fiber iteration
    fiber.dom = fiber.alternate.dom;

    // handle added props
    const addedProps = getAddedProps(fiber);
    // We use a non-null assertion here because it is covered by the if statement above,
    // but TypeScript is being dumb.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    addedProps.forEach((prop) => propUpdaters[fiber.type][prop[0]](fiber.dom!, prop[1]));

    const changedProps = getChangedProps(fiber);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    changedProps.forEach((prop) => propUpdaters[fiber.type][prop[0]](fiber.dom!, prop[1]));

    const removedProps = getRemovedProps(fiber);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    removedProps.forEach((prop) => propUpdaters[fiber.type][prop[0]](fiber.dom!, undefined));

    const oldEvents = getEvents(fiber.alternate.props);
    const newEvents = getEvents(fiber.props);
    oldEvents.forEach(([key, value]) => {
      const eventName = key.substring(eventPrefix.length);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fiber?.dom?.off(eventName, value as any);
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    newEvents.forEach(([key, value]) => {
      const eventName = key.substring(eventPrefix.length);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fiber?.dom?.on(eventName, value as any);
    });

    return true;
  }
  return false;
}

function isUpdatable(fiber: Fiber): boolean {
  const props = getProps(fiber.props);
  const updatableProps = Object.keys(propUpdaters[fiber.type ?? ''] ?? {});
  return !props.some(([key]) => !updatableProps.includes(key));
}

function getAddedProps(fiber: Fiber): [string, unknown][] {
  const prevProps = getProps(fiber?.alternate?.props ?? {}).map(([key]) => key);
  const currentProps = getProps(fiber.props);
  const addedProps = currentProps.filter(([key]) => !prevProps.includes(key));

  return addedProps;
}

function getRemovedProps(fiber: Fiber): [string, unknown][] {
  const prevProps = getProps(fiber?.alternate?.props ?? {});
  const currentProps = getProps(fiber.props).map(([key]) => key);
  const removedProps = prevProps.filter(([key]) => !currentProps.includes(key));

  return removedProps;
}

function getChangedProps(fiber: Fiber): [string, unknown][] {
  const prevProps = getProps(fiber?.alternate?.props ?? {});
  const prevPropKeys = prevProps.map(([key]) => key);
  const currentProps = getProps(fiber.props);
  const sharedProps = currentProps.filter(([key]) => prevPropKeys.includes(key));
  const changedProps = sharedProps.filter((entry) =>
    isChanged(entry, prevProps.find((prop) => prop[0] === entry[0]) ?? ['', '']),
  );

  return changedProps;
}
