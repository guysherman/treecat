import * as blessed from 'blessed'
import { Fiber } from './Fiber'
import { createNode } from './baseComponents'

// eslint-disable-next-line no-unused-vars
export function createDom (fiber: Fiber): blessed.Widgets.BlessedElement | undefined {
  let el: blessed.Widgets.BlessedElement
  switch (fiber.type) {
    case 'screen':
      throw Error('Creating screens via JSX is not supported')
    case 'box':
      el = createNode<blessed.Widgets.BoxElement, blessed.Widgets.BoxOptions>(fiber, blessed.box)
      break
    case 'text':
      el = createNode<blessed.Widgets.TextElement, blessed.Widgets.TextOptions>(fiber, blessed.text)
      break
    case 'line':
      el = createNode<blessed.Widgets.LineElement, blessed.Widgets.LineOptions>(fiber, blessed.line)
      break
    case 'list':
      el = createList(fiber)
      break
    case 'filemanager':
      el = createNode<blessed.Widgets.FileManagerElement, blessed.Widgets.FileManagerOptions>(fiber, blessed.filemanager)
      break
    case 'listtable':
      el = createNode<blessed.Widgets.ListTableElement, blessed.Widgets.ListTableOptions>(fiber, blessed.listtable)
      break
    case 'listbar':
      el = createNode<blessed.Widgets.ListbarElement, blessed.Widgets.ListbarOptions>(fiber, blessed.listbar)
      break
    case 'form':
      el = createNode<blessed.Widgets.FormElement<any>, blessed.Widgets.FormOptions>(fiber, blessed.form)
      break
    case 'textarea':
      el = createNode<blessed.Widgets.TextareaElement, blessed.Widgets.TextareaOptions>(fiber, blessed.textarea)
      break
    case 'textbox':
      el = createNode<blessed.Widgets.TextboxElement, blessed.Widgets.TextboxOptions>(fiber, blessed.textbox)
      break
    case 'button':
      el = createNode<blessed.Widgets.ButtonElement, blessed.Widgets.ButtonOptions>(fiber, blessed.button)
      break
    case 'checkbox':
      el = createNode<blessed.Widgets.CheckboxElement, blessed.Widgets.CheckboxOptions>(fiber, blessed.checkbox)
      break
    case 'radioset':
      el = createNode<blessed.Widgets.RadioSetElement, blessed.Widgets.RadioSetOptions>(fiber, blessed.radioset)
      break
    case 'radiobutton':
      el = createNode<blessed.Widgets.RadioButtonElement, blessed.Widgets.RadioButtonOptions>(fiber, blessed.radiobutton)
      break
    case 'prompt':
      el = createNode<blessed.Widgets.PromptElement, blessed.Widgets.PromptOptions>(fiber, blessed.prompt)
      break
    case 'question':
      el = createNode<blessed.Widgets.QuestionElement, blessed.Widgets.QuestionOptions>(fiber, blessed.question)
      break
    case 'message':
      el = createNode<blessed.Widgets.MessageElement, blessed.Widgets.MessageOptions>(fiber, blessed.message)
      break
    case 'loading':
      el = createNode<blessed.Widgets.LoadingElement, blessed.Widgets.LoadingOptions>(fiber, blessed.loading)
      break
    case 'progressbar':
      el = createNode<blessed.Widgets.ProgressBarElement, blessed.Widgets.ProgressBarOptions>(fiber, blessed.progressbar)
      break
    case 'log':
      el = createNode<blessed.Widgets.Log, blessed.Widgets.LogOptions>(fiber, blessed.log)
      break
    case 'table':
      el = createNode<blessed.Widgets.TableElement, blessed.Widgets.TableOptions>(fiber, blessed.table)
      break
    case 'TEXT_ELEMENT':
      if (fiber?.parent?.dom) {
        const parentElement = fiber.parent.dom as blessed.Widgets.BlessedElement
        if (parentElement) {
          parentElement.setContent(fiber.props.nodeValue)
        }
        return
      } else {
        throw Error('Text can only exist as a child of a BlessedElement')
      }
    default:
      return
  }

  return el
}

function createList (fiber: Fiber): blessed.Widgets.BlessedElement {
  const el = createNode<blessed.Widgets.ListElement, blessed.Widgets.ListOptions<any>>(fiber, blessed.list)
  const selected = (fiber?.alternate?.dom as any)?.selected ?? null
  if (selected) {
    el.select(selected)
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
      domParent.append(fiber.dom)
      if (fiber.props.focused) {
        (fiber.dom as blessed.Widgets.BlessedElement).focus()
      }
    } else if (fiber.effectTag === 'UPDATE' && fiber?.alternate?.dom && fiber.dom) {
      const childNodes: blessed.Widgets.Node[] = [...(fiber.alternate.dom.children)]

      for (let i = 0; i < childNodes.length; i++) {
        const cn: blessed.Widgets.Node = childNodes[0]
        cn.detach()
        fiber.dom.append(cn)
      }
      domParent.remove(fiber.alternate.dom)
      domParent.append(fiber.dom)
      if (fiber.props.focused) {
        fiber.dom.screen.focused = fiber.dom as blessed.Widgets.BlessedElement
      }
    } else if (fiber.effectTag === 'DELETION') {
      commitDelete(fiber, domParent)
    }
  } else if (!domParent) {
    throw Error('Parent has no dom!')
  }

  commitWork(fiber.child ?? null)

  if (fiber.effects) {
    for (const effect of fiber.effects) {
      const cleanup = effect()
      if (cleanup) {
        fiber.effectCleanups.push(cleanup)
      }
    }
  }

  commitWork(fiber.sibling ?? null)
}

function commitDelete (fiber: Fiber | null, domParent: blessed.Widgets.Node) {
  if (!fiber) {
    return
  }

  if (fiber.dom) {
    domParent.remove(fiber.dom)
    fiber.dom.destroy()
  } else {
    commitDelete(fiber?.child ?? null, domParent)
  }

  if (fiber.effectCleanups) {
    for (const cleanup of fiber.effectCleanups) {
      cleanup()
    }
  }
}
