import * as blessed from 'blessed'
import { createScreen } from './baseComponents/screen'
import { TreeCatElementBase } from './TreeCatElement'
export function createElement (type: any, props: any, ...children: any) {
  return {
    type: type.name,
    props: {
      ...props
    },
    children: children.map((child: any) =>
      typeof child === 'object'
        ? child
        : createTextElement(child)
    )

  }
}

function createTextElement (text: string) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text
    },
    children: []
  }
}

export function render (element: TreeCatElementBase, container?: blessed.Widgets.Node) {
  if (!container) {
    if (element.type !== 'Screen') {
      throw Error('Top-level TreeCatElement must be a <Screen />')
    }

    const el: blessed.Widgets.Screen = createScreen(element)

    if (element.children) {
      element.children.forEach((value: TreeCatElementBase) => {
        render(value, el)
      })
    }
  }


  // let el: blessed.Widgets.Node

  // switch (element) {
  // case 'Screen':
  // el = createScreen(element)
  // }

  // if (!container) {

  // }
}

