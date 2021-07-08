import * as blessed from 'blessed'
import { TreeCatElement } from '../TreeCatElement'

export type NodeCreator<TNode> = (options: any | undefined) => TNode

export function createNode<TNode, TNodeOptions> (element: TreeCatElement<TNodeOptions>, fnCreate: NodeCreator<TNode>): TNode {
  // eslint-disable-next-line no-unused-vars
  const node = fnCreate({ ...(element.props) })
  return node
}


export function Screen (_props: blessed.Widgets.IScreenOptions) {}
export function Box (_props: blessed.Widgets.BoxOptions) {}

