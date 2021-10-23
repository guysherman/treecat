import { Hook } from '../Hook'
import { RendererContext } from '../RendererContext'
import { Reducer } from '../types'

export function createHook (getContext: () => RendererContext):<T>(reducer: Reducer<T>, initial: T)=> [T, (action: any) => void] {
  const useReducer = <T>(reducer: Reducer<T>, initial: T): [T, (action: any) => void] => {
    const context = getContext()
    if (context?.wipFiber?.hookIndex !== undefined && context?.wipFiber?.hooks) {
      const oldHook: Hook | null = context.wipFiber?.alternate?.hooks?.[context.wipFiber.hookIndex] ?? null
      const hook: Hook = {
        state: oldHook?.state ?? initial,
        reducer: oldHook?.reducer ?? reducer
      }

      if (hook.reducer) {
        const reducerFunction = hook.reducer
        const dispatch = (action: any): void => {
          const newState = reducerFunction(hook.state, action)
          hook.state = newState
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
        return [hook.state, dispatch]
      } else {
        throw new Error('Some how the hook has no reducer')
      }
    } else {
      throw new Error('Either context is missing, or wipFiber has been incorrectly prepared')
    }
  }
  return useReducer
}
