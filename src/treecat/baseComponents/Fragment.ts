import { TreecatElement } from '../types/TreecatElement'
import { TreecatNode } from '../types/TreecatNode'

type FragmentProps = {
  children: TreecatNode
}

export function Fragment ({ children }: FragmentProps): TreecatNode {
  return children
}
