import { ElementDescription } from '../ElementDescription'


// eslint-disable-next-line no-unused-vars
export namespace JSX {
  // eslint-disable-next-line no-unused-vars
  export interface IntrinsicElements {
    box: any;
  }
}

export function createElement (type: any, props: any, ...children: any): ElementDescription {
  return {
    type: type,
    props: {
      ...props,
      children: children.map((child: any) =>
        typeof child === 'object'
          ? child
          : createTextElement(child)
      )

    }
  }
}


function createTextElement (text: string): ElementDescription {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: []
    }
  }
}

