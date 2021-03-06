import * as blessed from 'blessed';
import { Fiber } from './Fiber';
import { createNode } from './baseComponents';
import { updateProps } from './baseComponents';

// eslint-disable-next-line no-unused-vars
export function createDom(fiber: Fiber): blessed.Widgets.BlessedElement | undefined {
  let el: blessed.Widgets.BlessedElement;
  try {
    switch (fiber.type) {
      case 'screen':
        throw Error('Creating screens via JSX is not supported');
      case 'box':
        el = createNode<blessed.Widgets.BoxElement, blessed.Widgets.BoxOptions>(fiber, blessed.box);
        break;
      case 'text':
        el = createNode<blessed.Widgets.TextElement, blessed.Widgets.TextOptions>(fiber, blessed.text);
        break;
      case 'line':
        el = createNode<blessed.Widgets.LineElement, blessed.Widgets.LineOptions>(fiber, blessed.line);
        break;
      case 'list':
        el = createList(fiber);
        break;
      case 'filemanager':
        el = createNode<blessed.Widgets.FileManagerElement, blessed.Widgets.FileManagerOptions>(
          fiber,
          blessed.filemanager,
        );
        break;
      case 'listtable':
        el = createNode<blessed.Widgets.ListTableElement, blessed.Widgets.ListTableOptions>(fiber, blessed.listtable);
        break;
      case 'listbar':
        el = createNode<blessed.Widgets.ListbarElement, blessed.Widgets.ListbarOptions>(fiber, blessed.listbar);
        break;
      case 'form':
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        el = createNode<blessed.Widgets.FormElement<any>, blessed.Widgets.FormOptions>(fiber, blessed.form);
        break;
      case 'textarea':
        el = createNode<blessed.Widgets.TextareaElement, blessed.Widgets.TextareaOptions>(fiber, blessed.textarea);
        break;
      case 'textbox':
        el = createNode<blessed.Widgets.TextboxElement, blessed.Widgets.TextboxOptions>(fiber, blessed.textbox);
        break;
      case 'button':
        el = createNode<blessed.Widgets.ButtonElement, blessed.Widgets.ButtonOptions>(fiber, blessed.button);
        break;
      case 'checkbox':
        el = createNode<blessed.Widgets.CheckboxElement, blessed.Widgets.CheckboxOptions>(fiber, blessed.checkbox);
        break;
      case 'radioset':
        el = createNode<blessed.Widgets.RadioSetElement, blessed.Widgets.RadioSetOptions>(fiber, blessed.radioset);
        break;
      case 'radiobutton':
        el = createNode<blessed.Widgets.RadioButtonElement, blessed.Widgets.RadioButtonOptions>(
          fiber,
          blessed.radiobutton,
        );
        break;
      case 'prompt':
        el = createNode<blessed.Widgets.PromptElement, blessed.Widgets.PromptOptions>(fiber, blessed.prompt);
        break;
      case 'question':
        el = createNode<blessed.Widgets.QuestionElement, blessed.Widgets.QuestionOptions>(fiber, blessed.question);
        break;
      case 'message':
        el = createNode<blessed.Widgets.MessageElement, blessed.Widgets.MessageOptions>(fiber, blessed.message);
        break;
      case 'loading':
        el = createNode<blessed.Widgets.LoadingElement, blessed.Widgets.LoadingOptions>(fiber, blessed.loading);
        break;
      case 'progressbar':
        el = createNode<blessed.Widgets.ProgressBarElement, blessed.Widgets.ProgressBarOptions>(
          fiber,
          blessed.progressbar,
        );
        break;
      case 'log':
        el = createNode<blessed.Widgets.Log, blessed.Widgets.LogOptions>(fiber, blessed.log);
        break;
      case 'table':
        el = createNode<blessed.Widgets.TableElement, blessed.Widgets.TableOptions>(fiber, blessed.table);
        break;
      case 'TEXT_ELEMENT':
        if (fiber?.parent?.dom) {
          const parentElement = fiber.parent.dom as blessed.Widgets.BlessedElement;
          if (parentElement) {
            switch (fiber.parent.type) {
              case 'textarea':
              case 'textbox':
                (parentElement as blessed.Widgets.TextareaElement).setValue(fiber.props.nodeValue);
                break;
              default:
                parentElement.setContent(fiber.props.nodeValue);
                break;
            }
          }
          return;
        } else {
          throw Error('Text can only exist as a child of a BlessedElement');
        }
      default:
        return;
    }
  } catch (e) {
    throw e;
  }

  return el;
}

function createList(fiber: Fiber): blessed.Widgets.BlessedElement {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const el = createNode<blessed.Widgets.ListElement, blessed.Widgets.ListOptions<any>>(fiber, blessed.list);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selected = ((fiber?.alternate?.dom as any)?.selected || fiber.props['selected']) ?? null;
  if (selected) {
    el.select(selected);
  }

  return el;
}

export function commitWork(fiber: Fiber | null) {
  if (!fiber) {
    return;
  }

  // We use a non-null assertion here because the short-circuit
  // above handles it, and TypeScript is a bit dumb
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  let domParentFiber: Fiber = fiber!.parent as Fiber;
  // If you have a bunch of function components between host components
  // in the tree, this loop compacts that space, so that host components
  // get added to their real dom parent.
  while (!domParentFiber?.dom) {
    domParentFiber = domParentFiber.parent as Fiber;
    if (!domParentFiber) {
      return;
    }
  }

  const domParent: blessed.Widgets.Node | null = domParentFiber?.dom ?? null;
  if (domParent) {
    if (fiber.effectTag === 'PLACEMENT' && fiber.dom) {
      domParent.append(fiber.dom);
      if (fiber.props.focused) {
        (fiber.dom as blessed.Widgets.BlessedElement).focus();
      }
    } else if (fiber.effectTag === 'UPDATE') {
      updateDom(fiber, domParent);
    } else if (fiber.effectTag === 'DELETION') {
      commitDelete(fiber, domParent);
    }
  } else if (!domParent) {
    throw Error('Parent has no dom!');
  }

  commitWork(fiber.child ?? null);

  if (fiber.effects) {
    for (const effect of fiber.effects) {
      const cleanup = effect();
      if (cleanup) {
        if (!fiber.effectCleanups) {
          fiber.effectCleanups = [];
        }
        fiber.effectCleanups.push(cleanup);
      }
    }
  }

  commitWork(fiber.sibling ?? null);
}

function updateDom(fiber: Fiber, domParent: blessed.Widgets.Node) {
  try {
    const updated = updateProps(fiber);
    if (!updated) {
      replaceWithNew(fiber, domParent);
    }
  } catch (e) {
    throw e;
  }
}

function replaceWithNew(fiber: Fiber, domParent: blessed.Widgets.Node) {
  if (fiber?.alternate?.dom && fiber?.dom) {
    const childNodes: blessed.Widgets.Node[] = [...fiber.alternate.dom.children];

    for (let i = 0; i < childNodes.length; i++) {
      const cn: blessed.Widgets.Node = childNodes[0];
      cn.detach();
      fiber.dom.append(cn);
    }
    domParent.remove(fiber.alternate.dom);
    domParent.append(fiber.dom);
    if (fiber.props.focused) {
      fiber.dom.screen.focused = fiber.dom as blessed.Widgets.BlessedElement;
    }
  }
}

function commitDelete(fiber: Fiber | null, domParent: blessed.Widgets.Node) {
  if (!fiber) {
    return;
  }

  if (fiber.dom) {
    domParent.remove(fiber.dom);
    fiber.dom.destroy();
  } else {
    commitDelete(fiber?.child ?? null, domParent);
  }

  if (fiber.effectCleanups) {
    for (const cleanup of fiber.effectCleanups) {
      cleanup();
    }
  }
}
