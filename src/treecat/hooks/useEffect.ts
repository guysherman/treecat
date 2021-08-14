import { Hook } from '../Hook'
import { RendererContext } from '../RendererContext'

export function createHook (getContext: () => RendererContext): (...args: any[]) => any {
  return (effect: (...eventArgs: any[]) => void, deps?: any[]) => {
    if (typeof effect !== 'function') {
      throw new Error('Effect is not a function.')
    }
    const context = getContext()
    if (context?.wipFiber?.hookIndex !== undefined && context?.wipFiber?.hooks) {
      if (!context.wipFiber.effects) {
        context.wipFiber.effects = []
      }

      const oldHook: Hook | null = context.wipFiber?.alternate?.hooks?.[context.wipFiber.hookIndex] ?? null

      const hook: Hook = {
        state: oldHook?.state ?? effect,
        queue: [],
        deps: deps
      }

      const depsSame = areDepsSame(oldHook?.deps ?? undefined, deps)
      if (!depsSame) {
        if (context.wipFiber.alternate?.effectCleanups) {
          for (const cleanup of context.wipFiber.alternate.effectCleanups) {
            cleanup()
          }
        }
        context.wipFiber.effects.push(effect)
      }

      context.wipFiber.hooks.push(hook)
      context.wipFiber.hookIndex++
    } else {
      throw new Error('Either context is missing, or wipFiber has been incorrectly prepared')
    }
  }
}

function areDepsSame (oldDeps?: any[], newDeps?: any[]): boolean {
  if (!newDeps) {
    return false
  }

  if (!oldDeps) {
    return false
  }

  if (oldDeps.length !== newDeps.length) {
    return false
  }

  let depsSame = true
  for (let i = 0; i < newDeps.length && i < oldDeps.length; i++) {
    depsSame = depsSame && Object.is(oldDeps[i], newDeps[i])
  }

  return depsSame
}
