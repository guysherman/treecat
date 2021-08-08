import * as blessed from 'blessed'
import { ElementDescription } from './ElementDescription'
import { Fiber } from './Fiber'
import { RendererContext } from './RendererContext'
import { performUnitOfWork } from './FiberTree'
import { commitWork } from './Dom'
import { createHook as createUseState } from './hooks/useState'
export { createElement, JSX } from './jsx'

const context: RendererContext = {
  nextUnitOfWork: null,
  wipRoot: null,
  wipFiber: null,
  currentRoot: null,
  blessedRoot: null,
  deletions: [],
  shouldStopWorkloop: false,
  workLoopResolve: null
}

export const useState = createUseState(getContext)

export function render (element: ElementDescription, container: blessed.Widgets.Screen) {
  context.blessedRoot = container
  context.wipRoot = {
    hookIndex: 0,
    dom: container,
    props: {
      children: [element]
    },
    alternate: context.currentRoot
  }

  context.shouldStopWorkloop = false
  context.nextUnitOfWork = context.wipRoot
  setImmediate(workLoop)
}

export async function stopRendering (): Promise<void> {
  context.shouldStopWorkloop = true
  const p = new Promise<void>((resolve) => {
    context.workLoopResolve = resolve
  })
  return p
}

function workLoop () {
  while (context.nextUnitOfWork) {
    const [workUnit, localDeletions] = performUnitOfWork(context.nextUnitOfWork, setWipFiber)
    context.deletions.push(...localDeletions)
    context.nextUnitOfWork = workUnit
  }

  if (!context.nextUnitOfWork && context.wipRoot) {
    commitRoot()
  }

  if (!context.nextUnitOfWork && !context.wipRoot && context.shouldStopWorkloop) {
    context.workLoopResolve()
  } else {
    setTimeout(() => workLoop(), 30)
  }
}

function setWipFiber (fiber: Fiber | null): void {
  context.wipFiber = fiber
}

function getContext (): RendererContext {
  return context
}

function commitRoot () {
  context.deletions.forEach(commitWork)
  commitWork(context.wipRoot?.child ?? null)
  context.currentRoot = context.wipRoot
  context.blessedRoot?.render()
  context.wipRoot = null
}

