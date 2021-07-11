import * as blessed from 'blessed'
import { ElementDescription } from './ElementDescription'
import { createDom } from './Dom'

export type Fiber = ElementDescription & {
  dom?: blessed.Widgets.Node;
  parent?: Fiber;
  child?: Fiber;
  sibling?: Fiber;
  alternate?: Fiber | null;
  effectTag?: string;
}

export function performUnitOfWork (fiber: Fiber): [Fiber | null, Fiber[]] {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }


  const elements: Fiber[] = fiber.props.children
  const localDeletions: Fiber[] = reconcileChildren(fiber, elements)

  if (fiber.child) {
    return [fiber.child, localDeletions]
  }

  let nextFiber: Fiber | null = fiber
  while (nextFiber) {
    if (nextFiber.sibling) {
      return [nextFiber.sibling, localDeletions]
    }
    nextFiber = nextFiber?.parent ?? null
  }

  return [nextFiber, localDeletions]
}

function reconcileChildren (wipFiber: Fiber, elements: Fiber[]): Fiber[] {
  let index: number = 0
  let oldFiber: Fiber | null = wipFiber?.alternate?.child ?? null
  let prevSibling: Fiber | null = null
  const deletions: Fiber[] = []

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

  return deletions
}
