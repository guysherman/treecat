import { TreecatNode } from '../types';

type FragmentProps = {
  children: TreecatNode;
};

export function Fragment({ children }: FragmentProps): TreecatNode {
  return children;
}
