import { RendererContext } from '../RendererContext'

export function createHook (getContext: () => RendererContext): (...args: any[]) => any {
  return (effect: (...eventArgs: any[]) => void, deps?: any[]) => {
    if (typeof effect !== 'function') {
      throw new Error('Effect is not a function.')
    }
    const context = getContext()
    if (context?.wipFiber?.hookIndex !== undefined && context?.wipFiber?.hooks) {
      console.log('noop')
    } else {
      throw new Error('Either context is missing, or wipFiber has been incorrectly prepared')
    }
  }
}
