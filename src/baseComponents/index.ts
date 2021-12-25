import * as blessed from 'blessed';
import { Fiber } from '../Fiber';
import { eventPrefix, isEvent, isKeyEvent, isProp, keyEventPrefix } from './updateProps';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NodeCreator<TNode> = (options: any | undefined) => TNode;

export function createNode<TNode extends blessed.Widgets.Node, TNodeOptions>(
  element: Fiber,
  fnCreate: NodeCreator<TNode>,
): TNode {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options: any = {};
  Object.keys(element.props)
    .filter(isProp)
    .forEach((key) => {
      options[key] = element.props[key];
    });

  const node = fnCreate({ ...(options as TNodeOptions) });

  Object.keys(element.props)
    .filter(isEvent)
    .forEach((key) => {
      const eventName = key.substring(eventPrefix.length);
      node.on(eventName, element.props[key]);
    });

  Object.keys(element.props)
    .filter(isKeyEvent)
    .forEach((key) => {
      const eventName = key.substring(keyEventPrefix.length);
      (node as unknown as blessed.Widgets.BlessedElement).key(eventName, element.props[key]);
    });
  return node;
}

export { Fragment } from './Fragment';
export { updateProps } from './updateProps';
