import * as blessed from 'blessed'
import { createNode } from './baseComponents'
import { ElementDescription } from './ElementDescription'
import { Fiber } from './Fiber'

let nextUnitOfWork: Fiber | null
let wipRoot: Fiber | null
let currentRoot: Fiber | null
let blessedRoot: blessed.Widgets.Screen | null
// const deletions: Fiber[] = []

// const isEvent = key => key.startsWith('on')
// const isProperty = key => key !== 'children' && !isEvent(key)
// const isNew = (prev, next) => key => prev[key] !== next[key]
// const isGone = (prev, next) => key => !(key in next)

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


export function render (element: ElementDescription, container: blessed.Widgets.Screen) {
  console.log(JSON.stringify(element, null, '  '))
  blessedRoot = container
  wipRoot = {
    dom: container,
    props: {
      children: [element]
    },
    alternate: currentRoot
  }

  nextUnitOfWork = wipRoot
  setImmediate(() => workLoop())
}


// eslint-disable-next-line no-unused-vars
function createDom (fiber: Fiber): blessed.Widgets.Node | undefined {
  let el: blessed.Widgets.Node
  switch (fiber.type) {
    case 'screen':
      el = createNode<blessed.Widgets.Screen, blessed.Widgets.IScreenOptions>(fiber, blessed.screen)
      break
    case 'box':
      el = createNode<blessed.Widgets.BoxElement, blessed.Widgets.BoxOptions>(fiber, blessed.box)
      break
    case 'TEXT_ELEMENT':
    default:
      (fiber?.parent?.dom as blessed.Widgets.BlessedElement)?.setContent(fiber.props.nodeValue)
      return
  }

  return el
}


function workLoop () {
  const start: number = Date.now()
  let shouldYield: boolean = false
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    const now: number = Date.now()
    shouldYield = now - start > 16
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot()
  }

  setImmediate(() => workLoop())
}


function performUnitOfWork (fiber: Fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }


  const elements: Fiber[] = fiber.props.children
  let index: number = 0
  let prevSibling: Fiber | null = null

  while (index < elements.length) {
    const element = elements[index]

    const newFiber = {
      ...element,
      parent: fiber
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
    nextFiber = nextFiber?.parent ?? null
  }

  return nextFiber
}

function commitRoot () {
  commitWork(wipRoot?.child ?? null)
  currentRoot = wipRoot
  wipRoot = null
  blessedRoot?.render()
}

function commitWork (fiber: Fiber | null) {
  if (!fiber) {
    return
  }

  if (fiber.dom && fiber?.parent?.dom) {
    const domParent: blessed.Widgets.Node = fiber.parent.dom
    domParent.append(fiber.dom as blessed.Widgets.Node)
  }

  commitWork(fiber.child ?? null)
  commitWork(fiber.sibling ?? null)
}
