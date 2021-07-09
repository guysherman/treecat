import * as blessed from 'blessed'
import { Fiber } from '../Fiber'

export type NodeCreator<TNode> = (options: any | undefined) => TNode

export function createNode<TNode, TNodeOptions> (element: Fiber, fnCreate: NodeCreator<TNode>): TNode {
  console.log(`createNode: ${element.type}`)
  // eslint-disable-next-line no-unused-vars
  const { props: { children, ...options } } = element
  const node = fnCreate({ ...(options as TNodeOptions) })
  return node
}


export function Screen (_props: blessed.Widgets.IScreenOptions) {}
export function Box (_props: blessed.Widgets.BoxOptions) {}

