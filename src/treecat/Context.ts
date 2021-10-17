import { Context, ContextProviderProps, TypedContextElement } from './types'

export function createContext<T> (defaultValue: T): Context<T> {
  const context = {
    defaultValue,
    Provider: (props: ContextProviderProps<T>): TypedContextElement<T> => {
      const { value, children } = props
      return { context, value, children }
    }
  }

  return context
}
