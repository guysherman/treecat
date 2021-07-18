import * as blessed from 'blessed'
import { Fiber } from '../Fiber'

const eventPrefix: string = 'on'

function isEvent (key: string) {
  return key.startsWith(eventPrefix)
}

function isProp (key: string) {
  return key !== 'children' && !isEvent(key)
}

export type NodeCreator<TNode> = (options: any | undefined) => TNode

export function createNode<TNode extends blessed.Widgets.Node, TNodeOptions> (element: Fiber, fnCreate: NodeCreator<TNode>): TNode {
  // eslint-disable-next-line no-unused-vars
  const options: any = {}
  Object.keys(element.props).filter(isProp).forEach((key) => {
    options[key] = element.props[key]
  })

  const node = fnCreate({ ...(options as TNodeOptions) })

  Object.keys(element.props).filter(isEvent).forEach((key) => {
    const eventName = key.substring(eventPrefix.length)
    node.on(eventName, element.props[key])
  })
  return node
}


export function Screen (_props: blessed.Widgets.IScreenOptions) {}
export function Box (_props: blessed.Widgets.BoxOptions) {}

