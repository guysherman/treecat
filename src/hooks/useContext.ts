import { Fiber } from '../Fiber';
import { Hook } from '../Hook';
import { RendererContext } from '../RendererContext';
import { Context } from '../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createHook(getContext: () => RendererContext): (...args: any[]) => any {
  return <T>(context: Context<T>): T => {
    const rendererContext = getContext();
    if (rendererContext?.wipFiber?.hookIndex !== undefined && rendererContext?.wipFiber?.hooks) {
      let currentFiber: Fiber | undefined = rendererContext.wipFiber;
      while (currentFiber) {
        const provider = currentFiber?.contextProviders?.find((provider) => provider.context === context) ?? undefined;
        if (provider) {
          const hook: Hook = {
            state: provider.value,
          };

          rendererContext.wipFiber.hooks.push(hook);
          rendererContext.wipFiber.hookIndex++;

          return provider.value;
        }

        currentFiber = currentFiber.parent;
      }

      return context.defaultValue;
    } else {
      throw new Error('Either context is missing, or wipFiber has been incorrectly prepared');
    }
  };
}
