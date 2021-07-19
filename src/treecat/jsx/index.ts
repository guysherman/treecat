import { ElementDescription } from '../ElementDescription'


// eslint-disable-next-line no-unused-vars
export namespace JSX {
  // eslint-disable-next-line no-unused-vars
  export interface IntrinsicElements {
    box: any;
    text: any;
    line: any;
    bigtext: any;
    list: any;
    filemanager: any;
    listtable: any;
    listbar: any;
    form: any;
    textarea: any;
    textbox: any;
    button: any;
    checkbox: any;
    radioset: any;
    radiobutton: any;
    prompt: any;
    question: any;
    message: any;
    loading: any;
    progressbar: any;
    log: any;
    table: any;
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
      nodeValue: `${text}`,
      children: []
    }
  }
}

