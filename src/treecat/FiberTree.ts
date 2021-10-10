import { Fiber } from './Fiber'
import { createDom } from './Dom'

export function performUnitOfWork (fiber: Fiber, setWipFiber: (fiber: Fiber) => void): [Fiber | null, Fiber[]] {
  let localDeletions: Fiber[]

  if (fiber.type instanceof Function) {
    localDeletions = updateFunctionComponent(fiber, setWipFiber)
  } else {
    localDeletions = updateHostComponent(fiber)
  }

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

function updateFunctionComponent (fiber: Fiber, setWipFiber: (fiber: Fiber) => void): Fiber[] {
  fiber.hooks = []
  fiber.hookIndex = 0
  setWipFiber(fiber)
  const returned = fiber.type(fiber.props)
  const children = returned.length !== undefined ? returned : [returned]
  const localDeletions: Fiber[] = reconcileChildren(fiber, children)
  return localDeletions
}

function updateHostComponent (fiber: Fiber): Fiber[] {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }

  const elements: Fiber[] = fiber.props.children
  const localDeletions: Fiber[] = reconcileChildren(fiber, elements)
  return localDeletions
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
        hookIndex: 0,
        type: oldFiber?.type,
        props: element.props,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: 'UPDATE',
        effects: [],
        effectCleanups: []
      }
    }

    if (element && !sameType) {
      newFiber = {
        ...element,
        parent: wipFiber,
        effectTag: 'PLACEMENT',
        effects: [],
        effectCleanups: []
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
