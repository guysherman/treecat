export type TreecatElement = {
  type?: any;
  props: any & {
    children: TreecatElement[]
  }
}

