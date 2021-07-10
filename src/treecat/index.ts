import * as blessed from 'blessed'
import { createNode } from './baseComponents'
import { ElementDescription } from './ElementDescription'
import { Fiber } from './Fiber'
export { createElement, JSX } from './jsx'

let nextUnitOfWork: Fiber | null
let wipRoot: Fiber | null
let currentRoot: Fiber | null
let blessedRoot: blessed.Widgets.Screen | null
const deletions: Fiber[] = []


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
  reconcileChildren(fiber, elements)

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

function reconcileChildren (wipFiber: Fiber, elements: Fiber[]) {
  let index: number = 0
  let oldFiber: Fiber | null = wipFiber?.alternate?.child ?? null
  let prevSibling: Fiber | null = null

  while (index < elements.length || oldFiber !== null) {
    const element = elements[index]
    let newFiber: Fiber | null = null
    // eslint-disable-next-line eqeqeq
    const sameType = oldFiber && element && element.type == oldFiber.type

    if (sameType) {
      newFiber = {
        type: oldFiber?.type,
        props: element.props,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: 'UPDATE'
      }
    }

    if (element && !sameType) {
      newFiber = {
        ...element,
        parent: wipFiber,
        effectTag: 'PLACEMENT'
      }
    }

    if (oldFiber && !sameType) {
      oldFiber.effectTag = 'DELETION'
      deletions.push(oldFiber)
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling ?? null
    }
    if (index === 0) {
      wipFiber.child = newFiber ?? undefined
    } else {
      prevSibling!.sibling = newFiber ?? undefined
    }

    prevSibling = newFiber
    index++
  }
}

function commitRoot () {
  deletions.forEach(commitWork)
  commitWork(wipRoot?.child ?? null)
  currentRoot = wipRoot
  wipRoot = null
  blessedRoot?.render()
}

function commitWork (fiber: Fiber | null) {
  if (!fiber) {
    return
  }
  const domParent: blessed.Widgets.Node | null = fiber?.parent?.dom ?? null

  if (domParent && fiber?.dom) {
    if (fiber.effectTag === 'PLACEMENT') {
      domParent.append(fiber.dom as blessed.Widgets.Node)
    } else if (fiber.effectTag === 'UPDATE' &&
               fiber?.alternate?.dom) {
      const childNodes: blessed.Widgets.Node[] = [...(fiber.alternate.dom.children)]
      for (let i = 0; i < childNodes.length; i++) {
        const cn: blessed.Widgets.Node = childNodes[0]
        cn.detach()
        fiber.dom.append(cn)
      }
      domParent.append(fiber.dom as blessed.Widgets.Node)
    } else if (fiber.effectTag === 'DELETION') {
      domParent.remove(fiber!.dom as blessed.Widgets.Node)
    }
  }

  commitWork(fiber.child ?? null)
  commitWork(fiber.sibling ?? null)
}

