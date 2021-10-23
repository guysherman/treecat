import * as blessed from 'blessed'
import * as fs from 'fs'
import { createContext } from './Context'
import { performUnitOfWork } from './FiberTree'
import { TypedContextElement } from './types'

describe('Context', () => {
  let rootScreen: blessed.Widgets.Screen
  let outStream: fs.WriteStream
  let inStream: fs.ReadStream

  beforeEach(() => {
    jest.useFakeTimers()
    outStream = fs.createWriteStream('./.scratch/out')
    inStream = fs.createReadStream('/dev/random')
    rootScreen = blessed.screen({ output: inStream, input: outStream })
  })

  afterEach(() => {
    rootScreen.destroy()
    outStream.close()
    inStream.close()
    jest.useRealTimers()
  })

  test('should return a create a context object', () => {
    const context = createContext('default value')
    const providerResult = context.Provider({
      value: 'foo',
      children: [{
        type: 'box',
        props: {
          children: []
        }
      }]
    })

    expect(context.defaultValue).toEqual('default value')

    expect((providerResult as TypedContextElement<string>).context).toEqual(context)
  })

  test('should add provider to fiber', () => {
    const context = createContext('default value')
    const root = {
      dom: rootScreen,
      effects: [],
      effectCleanups: [],
      props: {
        children: [
          {
            type: context.Provider,
            props: {
              value: 'foo',
              children: [
                {
                  type: 'box',
                  props: {
                    children: []
                  }
                }
              ]
            }
          }
        ]
      }
    }

    const setWipFiber = jest.fn()
    const [workUnit] = performUnitOfWork(root, setWipFiber)
    const [workUnit2] = performUnitOfWork(workUnit!, setWipFiber)
    expect(workUnit!.effectTag).toEqual('PLACEMENT')
    expect(workUnit?.contextProviders).toHaveLength(1)
    expect(workUnit2!.type).toEqual('box')
    expect(workUnit2!.props!.children!).toEqual([])
  })
})
