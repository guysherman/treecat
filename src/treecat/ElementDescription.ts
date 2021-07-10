export type ElementDescription = {
  type?: any;
  props: any & {
    children: ElementDescription[]
  }
}

