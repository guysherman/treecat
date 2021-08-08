import { Fiber } from '../Fiber'
import { Hook } from '../Hook'
import { RendererContext } from '../RendererContext'
import { createHook } from './useEffect'

describe.skip('useEffect', () => {
  test('should throw if context is broken', () => {
    const getContextBroken = () => {
      return {
        wipFiber: {}
      } as RendererContext
    }

    const useEffect = createHook(getContextBroken)

    expect(() => useEffect(() => {})).toThrow()
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

    const useEffect = createHook(getContext)
    useEffect(() => {})
  })

  test('should throw if effect is not a function', () => {
    const getContext = () => {
      return {
        wipFiber: {
          hookIndex: 0,
          hooks: [] as Hook[]
        }
      } as RendererContext
    }

    const useEffect = createHook(getContext)
    expect(() => useEffect(23)).toThrow()
  })


  test('should queue effect', () => {
    const fib1: Fiber = {
      hookIndex: 0,
      hooks: [] as Hook[],
      props: []
    }
    const getContext = () => {
      return {
        wipFiber: fib1
      } as RendererContext
    }
    const mock = jest.fn()

    const useEffect = createHook(getContext)
    useEffect(mock)

    expect(fib1!.effects![0]).toBe(mock)
  })

  test('should not queue effect on second frame when deps = []', () => {
    const fib1: Fiber = {
      hookIndex: 0,
      hooks: [] as Hook[],
      props: []
    }

    const fib2: Fiber = {
      hookIndex: 0,
      hooks: [] as Hook[],
      props: [],
      alternate: fib1
    }

    const context = {
      wipFiber: fib1
    } as RendererContext

    const getContext = () => context
    const useEffect = createHook(getContext)

    const mock = jest.fn()
    useEffect(mock, [])

    context.wipFiber = fib2

    expect(fib1!.effects![0]).toBe(mock)

    useEffect(mock, [])
    expect(fib2!.effects!.length).toBe(0)
  })

  test('should not queue on second frame when deps are same', () => {
    const fib1: Fiber = {
      hookIndex: 0,
      hooks: [] as Hook[],
      props: []
    }

    const fib2: Fiber = {
      hookIndex: 0,
      hooks: [] as Hook[],
      props: [],
      alternate: fib1
    }

    const context = {
      wipFiber: fib1
    } as RendererContext

    const getContext = () => context
    const useEffect = createHook(getContext)

    const mock = jest.fn()
    const dep = { a: 'foo', b: 7 }
    useEffect(mock, [5, dep])

    context.wipFiber = fib2

    expect(fib1!.effects![0]).toBe(mock)

    useEffect(mock, [5, dep])
    expect(fib2!.effects!.length).toBe(0)
  })

  test('should queue every frame when deps is undefined', () => {
    const fib1: Fiber = {
      hookIndex: 0,
      hooks: [] as Hook[],
      props: []
    }

    const fib2: Fiber = {
      hookIndex: 0,
      hooks: [] as Hook[],
      props: [],
      alternate: fib1
    }

    const context = {
      wipFiber: fib1
    } as RendererContext

    const getContext = () => context
    const useEffect = createHook(getContext)

    const mock = jest.fn()
    // eslint-disable-next-line no-unused-vars
    const dep = { a: 'foo', b: 7 }
    useEffect(mock)

    context.wipFiber = fib2

    expect(fib1!.effects![0]).toBe(mock)

    useEffect(mock)
    expect(fib2!.effects![0]).toBe(mock)
  })

  test('queue should clean up previous effect', () => {
    const fib1: Fiber = {
      hookIndex: 0,
      hooks: [] as Hook[],
      props: []
    }

    const fib2: Fiber = {
      hookIndex: 0,
      hooks: [] as Hook[],
      props: [],
      alternate: fib1
    }

    const context = {
      wipFiber: fib1
    } as RendererContext

    const getContext = () => context
    const useEffect = createHook(getContext)

    const mockCleanup = jest.fn()
    const mock = jest.fn(() => mockCleanup)
    // eslint-disable-next-line no-unused-vars
    const dep = { a: 'foo', b: 7 }
    useEffect(mock)

    // Simulate moving to next frame, applying effects, etc
    context.wipFiber = fib2
    fib1.effectCleanups = [fib1!.effects![0]() as (() => void)]

    expect(fib1!.effects![0]).toBe(mock)

    useEffect(mock)
    expect(fib2!.effects![0]).toBe(mock)
    expect(mockCleanup).toBeCalled()
  })
})

