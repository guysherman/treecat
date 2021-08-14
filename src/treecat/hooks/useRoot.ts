import * as blessed from 'blessed'
import { RendererContext } from '../RendererContext'

export function createHook (getContext: () => RendererContext): () => blessed.Widgets.Screen | null {
  const useRoot = () => {
    const context = getContext()
    return context?.blessedRoot ?? null
  }

  return useRoot
}
