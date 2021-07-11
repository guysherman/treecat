import * as blessed from 'blessed'
import { Fiber } from './Fiber'
import { createNode } from './baseComponents'

// eslint-disable-next-line no-unused-vars
export function createDom (fiber: Fiber): blessed.Widgets.Node | undefined {
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

export function commitWork (fiber: Fiber | null) {
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

