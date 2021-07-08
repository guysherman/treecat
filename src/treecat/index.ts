import * as blessed from 'blessed'
import { createNode } from './baseComponents'
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
  console.log(JSON.stringify(element, null, '  '))
  if (!container) {
    if (element.type !== 'Screen') {
      throw Error('Top-level TreeCatElement must be a <Screen />')
    }

    const el: blessed.Widgets.Screen = createNode<blessed.Widgets.Screen, blessed.Widgets.IScreenOptions>(element, blessed.screen)

    el.program.on('keypress', (_ch: string, key: blessed.Widgets.Events.IKeyEventArg) => {
      if (key.full === 'C-c') {
        process.exit(0)
      }
    })

    if (element.children) {
      element.children.forEach((value: TreeCatElementBase) => {
        render(value, el)
      })
    }

    el.render()
  }


  let el: blessed.Widgets.Node

  switch (element.type) {
    case 'Box':
    default:
      el = createNode<blessed.Widgets.BoxElement, blessed.Widgets.BoxOptions>(element, blessed.box)
  }

  if (container) {
    container.append(el)
  }
}

