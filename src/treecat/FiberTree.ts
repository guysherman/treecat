import { Fiber } from './Fiber'
import { createDom } from './Dom'
import { TreecatElement, TreecatNode } from './types'

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
  if (!fiber.type) {
    throw new Error('fiber.type was undefined')
  }
  if (typeof fiber.type === 'string') {
    throw new Error('Invalid function component')
  }
  const returned = fiber.type(fiber.props)
  if ('context' in returned && 'value' in returned) {
    if (!fiber.contextProviders) {
      fiber.contextProviders = [returned]
    } else {
      fiber.contextProviders.push(returned)
    }
    return reconcileChildren(fiber, returned.children)
  } else {
    return reconcileChildren(fiber, returned)
  }
}

function updateHostComponent (fiber: Fiber): Fiber[] {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }

  const elements = fiber?.props?.children ?? []
  const localDeletions: Fiber[] = reconcileChildren(fiber, elements)
  return localDeletions
}

function reconcileChildren (wipFiber: Fiber, node: TreecatNode): Fiber[] {
  let index: number = 0
  let oldFiber: Fiber | null = wipFiber?.alternate?.child ?? null
  let prevSibling: Fiber | null = null
  const deletions: Fiber[] = []
  const elements: TreecatElement[] = 'length' in node ? node : [node]

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
        effectCleanups: [],
        contextProviders: []
      }
    }

    if (element && !sameType) {
      newFiber = {
        ...element,
        parent: wipFiber,
        effectTag: 'PLACEMENT',
        effects: [],
        effectCleanups: [],
        contextProviders: []
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
