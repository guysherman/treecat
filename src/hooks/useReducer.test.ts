import { Fiber } from '../Fiber';
import { Hook } from '../Hook';
import { RendererContext } from '../RendererContext';
import { createHook } from './useReducer';

describe('useReducer', () => {
  it('should throw if RendererContext is broken', () => {
    const getContextBroken = () => {
      return {
        wipFiber: {},
      } as RendererContext;
    };

    const useReducer = createHook(getContextBroken);

    expect(() => useReducer((state, action) => state + (action as number), 0)).toThrow();
  });

  it('should not throw if RendererContext is good', () => {
    const getContext = () => {
      return {
        wipFiber: {
          hookIndex: 0,
          hooks: [] as Hook[],
        },
      } as RendererContext;
    };

    const useReducer = createHook(getContext);
    useReducer((state, action) => state + action, 23);
  });

  it('should return a state and a dispatch function', () => {
    const getContext = () => {
      return {
        wipFiber: {
          hookIndex: 0,
          hooks: [] as Hook[],
        },
      } as RendererContext;
    };

    const useReducer = createHook(getContext);
    const [state, func] = useReducer((state, action) => state + action, 23);
    expect(state).toBe(23);
    expect(typeof func).toEqual('function');
  });

  it('should call reducer with previous state and supplied action', () => {
    const rendererContext = {
      wipFiber: {
        hookIndex: 0,
        hooks: [] as Hook[],
      },
    } as RendererContext;

    const getContext = () => {
      return rendererContext;
    };

    const reducer = jest.fn();

    const useReducer = createHook(getContext);
    const [state, func] = useReducer(reducer, 23);
    expect(state).toBe(23);

    func(24);
    expect(reducer).toBeCalledWith(23, 24);
    expect(typeof func).toEqual('function');
    expect(rendererContext.nextUnitOfWork).toBeTruthy();
  });

  it('calling the hook multiple times per frame should return different state/dispatch pairs', () => {
    const getContext = () => {
      return {
        wipFiber: {
          hookIndex: 0,
          hooks: [] as Hook[],
        },
      } as RendererContext;
    };

    const useReducer = createHook(getContext);
    const [state, func] = useReducer<number[]>((state, action) => [...state, action as number], []);
    const [state2, func2] = useReducer<number>((state, action) => state + (action as number), 0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((state as any) === (state2 as any)).toBe(false);
    expect(func === func2).toBe(false);
  });

  test('calling the hook for a new frame should return updated state', () => {
    const fib1: Fiber = {
      hookIndex: 0,
      hooks: [] as Hook[],
      props: { children: [] },
      effects: [],
      effectCleanups: [],
    };

    const fib2 = {
      hookIndex: 0,
      hooks: [] as Hook[],
      alternate: fib1,
      props: { children: [] },
      effects: [],
      effectCleanups: [],
    };

    const fib3 = {
      hookIndex: 0,
      hooks: [] as Hook[],
      alternate: fib2,
      props: { children: [] },
      effects: [],
      effectCleanups: [],
    };
    const context: RendererContext = {
      wipFiber: fib1,
    } as RendererContext;

    const getContext = () => {
      return context;
    };
    const useReducer = createHook(getContext);

    const [state, func] = useReducer<number[]>((state, action) => [...state, action as number], []);
    expect(state).toEqual([]);
    expect(fib1.hookIndex).toBe(1);
    func(42);

    context.wipFiber = fib2;
    const [state2, func2] = useReducer<number[]>((state, action) => [...state, action as number], []);
    expect(state2).toEqual([42]);
    func2(84);

    context.wipFiber = fib3;
    const [state3] = useReducer<number[]>((state, action) => [...state, action as number], []);
    expect(state3).toEqual([42, 84]);
  });
});
