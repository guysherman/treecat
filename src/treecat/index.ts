import * as blessed from 'blessed'
import { ElementDescription } from './ElementDescription'
import { Fiber, performUnitOfWork } from './Fiber'
import { commitWork } from './Dom'
export { createElement, JSX } from './jsx'

let nextUnitOfWork: Fiber | null
let wipRoot: Fiber | null
let currentRoot: Fiber | null
let blessedRoot: blessed.Widgets.Screen | null
const deletions: Fiber[] = []
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


function workLoop () {
  const start: number = Date.now()
  let shouldYield: boolean = false
  while (nextUnitOfWork && !shouldYield) {
    const [workUnit, localDeletions] = performUnitOfWork(nextUnitOfWork)
    deletions.push(...localDeletions)
    nextUnitOfWork = workUnit

    const now: number = Date.now()
    shouldYield = now - start > 16
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot()
  }

  if (!nextUnitOfWork && !wipRoot && shouldStopWorkloop) {
    workLoopResolve()
  } else {
    setImmediate(() => workLoop())
  }
}


function commitRoot () {
  deletions.forEach(commitWork)
  commitWork(wipRoot?.child ?? null)
  currentRoot = wipRoot
  wipRoot = null
  blessedRoot?.render()
}

