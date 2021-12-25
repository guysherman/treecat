import * as blessed from 'blessed';
import * as fs from 'fs';
import { createContext } from '../Context';
import { Hook } from '../Hook';
import { RendererContext } from '../RendererContext';
import { createHook } from './useContext';
import { Fiber } from '../Fiber';

describe('useContext', () => {
  let rootScreen: blessed.Widgets.Screen;
  let outStream: fs.WriteStream;
  let inStream: fs.ReadStream;

  beforeEach(() => {
    jest.useFakeTimers();
    outStream = fs.createWriteStream('./.scratch/out');
    inStream = fs.createReadStream('/dev/random');
    rootScreen = blessed.screen({ output: inStream, input: outStream });
  });

  afterEach(() => {
    rootScreen.destroy();
    outStream.close();
    inStream.close();
    jest.useRealTimers();
  });

  test('should throw if RendererContext is broken', () => {
    const getContextBroken = () => {
      return {
        wipFiber: {},
      } as RendererContext;
    };

    const useEffect = createHook(getContextBroken);

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    expect(() => useEffect(() => {})).toThrow();
  });

  test('should not throw for valid RendererContext', () => {
    const getContext = () => {
      return {
        wipFiber: {
          hookIndex: 0,
          hooks: [] as Hook[],
        },
      } as RendererContext;
    };

    const useEffect = createHook(getContext);
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    useEffect(() => {});
  });

  test('should return default value if there are no providers', () => {
    const context = createContext('default');
    const fib1: Fiber = {
      hookIndex: 0,
      hooks: [] as Hook[],
      props: { children: [] },
      effects: [],
      effectCleanups: [],
    };

    const rendererContext = {
      wipFiber: fib1,
    } as RendererContext;
    const getContext = () => rendererContext;
    const useContext = createHook(getContext);

    const value = useContext(context);
    expect(value).toEqual('default');
  });

  test('should return the correct value from the nearest provider', () => {
    const context = createContext('default');
    const fib1: Fiber = {
      hookIndex: 0,
      hooks: [] as Hook[],
      props: { children: [] },
      effects: [],
      effectCleanups: [],
      contextProviders: [
        {
          context,
          value: 'foo',
          children: [],
        },
      ],
    };

    const fib2: Fiber = {
      hookIndex: 0,
      hooks: [] as Hook[],
      props: {
        children: [
          {
            type: 'box',
            props: {
              children: [],
            },
          },
        ],
      },
      effects: [],
      effectCleanups: [],
      parent: fib1,
    };

    const rendererContext = {
      wipFiber: fib2,
    } as RendererContext;
    const getContext = () => rendererContext;
    const useContext = createHook(getContext);

    const value = useContext(context);
    expect(value).toEqual('foo');
  });

  it('dummy test', () => {
    expect(true).toBe(true);
  });
});
