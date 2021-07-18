import * as blessed from 'blessed'
import { ElementDescription } from './ElementDescription'
import { Fiber, Hook, performUnitOfWork } from './Fiber'
import { commitWork } from './Dom'
export { createElement, JSX } from './jsx'

let nextUnitOfWork: Fiber | null
let wipRoot: Fiber | null
let wipFiber: Fiber | null
let hookIndex: number = 0
let currentRoot: Fiber | null
let blessedRoot: blessed.Widgets.Screen | null
let deletions: Fiber[] = []
let shouldStopWorkloop: boolean = false
let workLoopResolve: any = null

export function render (element: ElementDescription, container: blessed.Widgets.Screen) {
  blessedRoot = container
  wipRoot = {
    dom: container,
    props: {
      children: [element]
    },
    alternate: currentRoot
  }

  shouldStopWorkloop = false
  nextUnitOfWork = wipRoot
  setImmediate(workLoop)
}

export async function stopRendering (): Promise<void> {
  shouldStopWorkloop = true
  const p = new Promise<void>((resolve) => {
    workLoopResolve = resolve
  })
  return p
}

export function useState (initial: any): [any, (action: (...args: any[]) => any) => void] {
  const oldHook: Hook | null = wipFiber?.alternate?.hooks?.[hookIndex] ?? null
  const hook: Hook = {
    state: oldHook?.state ?? initial,
    queue: []
  }

  const actions = oldHook?.queue ?? []
  actions.forEach(action => {
    hook.state = action(hook.state)
  })

  const setState = (action: (...args: any[]) => any): void => {
    hook.queue.push(action)
    wipRoot = {
      dom: currentRoot?.dom,
      props: currentRoot?.props,
      alternate: currentRoot
    }

    nextUnitOfWork = wipRoot
    deletions = []
  }

  wipFiber?.hooks?.push(hook)
  hookIndex++
  return [hook.state, setState]
}


function workLoop () {
  while (nextUnitOfWork) {
    const [workUnit, localDeletions] = performUnitOfWork(nextUnitOfWork, setWipFiber, resetHookIndex)
    deletions.push(...localDeletions)
    nextUnitOfWork = workUnit
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot()
  }

  if (!nextUnitOfWork && !wipRoot && shouldStopWorkloop) {
    workLoopResolve()
  } else {
    setTimeout(() => workLoop(), 30)
  }
}

function setWipFiber (fiber: Fiber | null): void {
  wipFiber = fiber
}

function resetHookIndex (): void {
  hookIndex = 0
}

function commitRoot () {
  deletions.forEach(commitWork)
  commitWork(wipRoot?.child ?? null)
  currentRoot = wipRoot
  wipRoot = null
  blessedRoot?.render()
}

