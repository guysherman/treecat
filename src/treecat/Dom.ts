import * as blessed from 'blessed'
import { Fiber } from './Fiber'
import { createNode } from './baseComponents'

// eslint-disable-next-line no-unused-vars
export function createDom (fiber: Fiber): blessed.Widgets.Node | undefined {
  let el: blessed.Widgets.Node
  switch (fiber.type) {
    case 'screen':
      throw Error('Creating screens via JSX is not supported')
    case 'box':
      el = createNode<blessed.Widgets.BoxElement, blessed.Widgets.BoxOptions>(fiber, blessed.box)
      break
    case 'TEXT_ELEMENT':
      if (fiber?.parent?.dom as blessed.Widgets.BlessedElement) {
        (fiber!.parent!.dom as blessed.Widgets.BlessedElement)!.setContent(fiber.props.nodeValue)
        return
      } else {
        throw Error('Text can only exist as a child of a BlessedElement')
      }
    default:
      return
  }

  return el
}

export function commitWork (fiber: Fiber | null) {
  if (!fiber) {
    return
  }

  let domParentFiber: Fiber = fiber!.parent as Fiber
  while (!domParentFiber?.dom) {
    domParentFiber = domParentFiber.parent as Fiber
    if (!domParentFiber) {
      return
    }
  }
  const domParent: blessed.Widgets.Node | null = domParentFiber?.dom ?? null
  if (domParent) {
    if (fiber.effectTag === 'PLACEMENT' && fiber.dom) {
      domParent.append(fiber.dom as blessed.Widgets.Node)
    } else if (fiber.effectTag === 'UPDATE' && fiber?.alternate?.dom && fiber.dom) {
      const childNodes: blessed.Widgets.Node[] = [...(fiber.alternate.dom.children)]

      for (let i = 0; i < childNodes.length; i++) {
        const cn: blessed.Widgets.Node = childNodes[0]
        cn.detach()
        fiber.dom.append(cn)
      }

      domParent.remove(fiber.alternate.dom as blessed.Widgets.Node)
      domParent.append(fiber.dom as blessed.Widgets.Node)
    } else if (fiber.effectTag === 'DELETION') {
      commitDelete(fiber, domParent)
    }
  } else if (!domParent) {
    throw Error('Parent has no dom!')
  }

  commitWork(fiber.child ?? null)
  commitWork(fiber.sibling ?? null)
}

function commitDelete (fiber: Fiber | null, domParent: blessed.Widgets.Node) {
  if (!fiber) {
    return
  }

  if (fiber?.dom) {
    domParent.remove(fiber!.dom as blessed.Widgets.Node)
    fiber.dom.destroy()
  } else {
    commitDelete(fiber?.child ?? null, domParent)
  }
}
