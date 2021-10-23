import { Hook } from '../Hook'
import { RendererContext } from '../RendererContext'

export function createHook (getContext: () => RendererContext): (...args: any[]) => any {
  const useState = (initial: any): [any, (value: any) => void] => {
    const context = getContext()
    if (context?.wipFiber?.hookIndex !== undefined && context?.wipFiber?.hooks) {
      const oldHook: Hook | null = context.wipFiber?.alternate?.hooks?.[context.wipFiber.hookIndex] ?? null
      const hook: Hook = {
        state: oldHook?.state ?? initial
      }

      const setState = (value: any): void => {
        hook.state = value
        context.wipRoot = {
          dom: context?.currentRoot?.dom,
          props: context?.currentRoot?.props ?? {},
          effects: [],
          effectCleanups: [],
          alternate: context?.currentRoot
        }

        context.nextUnitOfWork = context?.wipRoot
        context.deletions = []
      }

      context.wipFiber.hooks.push(hook)
      context.wipFiber.hookIndex++
      return [hook.state, setState]
    } else {
      throw new Error('Either context is missing, or wipFiber has been incorrectly prepared')
    }
  }
  return useState
}
