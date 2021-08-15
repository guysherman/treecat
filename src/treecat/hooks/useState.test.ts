import { Fiber } from '../Fiber'
import { Hook } from '../Hook'
import { RendererContext } from '../RendererContext'
import { createHook } from './useState'


test('should throw if context is broken', () => {
  const getContextBroken = () => {
    return {
      wipFiber: {}
    } as RendererContext
  }

  const useState = createHook(getContextBroken)

  expect(() => useState(0)).toThrow()
})

test('should not throw for valid context', () => {
  const getContext = () => {
    return {
      wipFiber: {
        hookIndex: 0,
        hooks: [] as Hook[]
      }
    } as RendererContext
  }

  const useState = createHook(getContext)
  useState(23)
})

test('should return a state and an set func', () => {
  const getContext = () => {
    return {
      wipFiber: {
        hookIndex: 0,
        hooks: [] as Hook[]
      }
    } as RendererContext
  }

  const useState = createHook(getContext)
  const [state, func] = useState(23)
  expect(state).toBe(23)
  expect(typeof func).toEqual('function')
})

test('calling the hook again in the same frame should return a different state etc', () => {
  const getContext = () => {
    return {
      wipFiber: {
        hookIndex: 0,
        hooks: [] as Hook[]
      }
    } as RendererContext
  }

  const useState = createHook(getContext)
  const [state, func] = useState([])
  const [state2, func2] = useState([])
  expect(state === state2).toBe(false)
  expect(func === func2).toBe(false)
})

test('calling the hook for a new frame should return updated state', () => {
  const fib1: Fiber = {
    hookIndex: 0,
    hooks: [] as Hook[],
    props: [],
    effects: [],
    effectCleanups: []
  }

  const fib2 = {
    hookIndex: 0,
    hooks: [] as Hook[],
    alternate: fib1,
    props: [],
    effects: [],
    effectCleanups: []
  }

  const context: RendererContext = {
    wipFiber: fib1
  } as RendererContext

  const getContext = () => {
    return context
  }
  const useState = createHook(getContext)

  const [state, func] = useState(0)
  expect(state).toBe(0)
  expect(fib1.hookIndex).toBe(1)
  func(42)

  context.wipFiber = fib2
  const [state2] = useState(0)

  expect(state2).toBe(42)
})
