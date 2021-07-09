export type ElementDescription = {
  type?: string;
  props: any & {
    children: ElementDescription[]
  }
}

