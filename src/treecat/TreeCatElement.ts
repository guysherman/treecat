export interface TreeCatElementBase {
  type: string;
  props: any;
  children: TreeCatElementBase[]
}

export interface TreeCatElement<TProps> extends TreeCatElementBase {
  type: string;
  props: TProps;
  children: TreeCatElementBase[]
}
