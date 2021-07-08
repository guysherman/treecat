import * as blessed from 'blessed'
import { argv0 } from 'process'
import { createNode } from './baseComponents'
import { Fiber } from './Fiber'

let nextUnitOfWork: Fiber | null = null

export function createElement (type: any, props: any, ...children: any): Fiber {
  return {
    type: type.name,
    props: {
      ...props,
      children: children.map((child: any) =>
        typeof child === 'object'
          ? child
          : createTextElement(child)
      )

    },
    parent: null,
    child: null,
    sibling: null

  }
}

function createTextElement (text: string): Fiber {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: []
    },
    parent: null,
    child: null,
    sibling: null
  }
}

// function setTextContent (element: blessed.Widgets.BlessedElement, textContent: string) {
// element.setContent(textContent)
// }

export function render (element: TreeCatElementBase, container?: blessed.Widgets.Node) {
  console.log(JSON.stringify(element, null, '  '))
  // if (!container) {
  // if (element.type !== 'Screen') {
  // throw Error('Top-level TreeCatElement must be a <Screen />')
  // }


  // el.program.on('keypress', (_ch: string, key: blessed.Widgets.Events.IKeyEventArg) => {
  // if (key.full === 'C-c') {
  // process.exit(0)
  // }
  // })

  // if (element.children) {
  // element.children.forEach((value: TreeCatElementBase) => {
  // render(value, el)
  // })
  // }

  // el.render()
  // }


  // if (container) {
  // container.append(el)
  // }
  //
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [element]
    },
    parent: null,
    child: null,
    sibling: null
  }
}


// eslint-disable-next-line no-unused-vars
function createDom (fiber: Fiber): blessed.Widgets.Node {
  let el: blessed.Widgets.Node
  switch (fiber.type) {
    case 'Screen':
      el = createNode<blessed.Widgets.Screen, blessed.Widgets.IScreenOptions>(fiber, blessed.screen)
      break
    case 'Box':
    default:
      el = createNode<blessed.Widgets.BoxElement, blessed.Widgets.BoxOptions>(fiber, blessed.box)
      break
  }

  return el
}


function workLoop () {
  while (nextUnitOfWork) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
  }
}


function performUnitOfWork (fiber: Fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }

  if (fiber.parent) {
    fiber.parent.dom!.append(fiber.dom)
  }

  const elements: Fiber[] = fiber.props.children
  let index: number = 0
  let prevSibling: Fiber | null = null

  while (index < elements.length) {
    const element = elements[index]

    const newFiber = {
      ...element,
      parent: fiber,
      dom: null
    }

    if (index === 0) {
      fiber.child = newFiber
    } else {
      prevSibling!.sibling = newFiber
    }

    prevSibling = newFiber
    index++
  }
  if (fiber.child) {
    return fiber.child
  }

  let nextFiber: Fiber | null = fiber
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
  }
}
