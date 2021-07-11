import * as blessed from 'blessed'
import * as fs from 'fs'
import { Fiber, performUnitOfWork } from './Fiber'

let rootScreen: blessed.Widgets.Screen
let outStream: fs.WriteStream
let inStream: fs.ReadStream

beforeEach(() => {
  jest.useFakeTimers()
  outStream = fs.createWriteStream('./out')
  inStream = fs.createReadStream('/dev/random')
  rootScreen = blessed.screen({ output: inStream, input: outStream })
})

test('Simple Box', () => {
  const root = {
    dom: rootScreen,
    props: {
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

  const [workUnit] = performUnitOfWork(root)
  expect(workUnit!.type).toEqual('box')

  const { props: { children } } = workUnit as Fiber
  expect(children).toEqual([])
})

test('Box with multiple boxes', () => {
  const root = {
    dom: rootScreen,
    props: {
      children: [
        {
          type: 'box',
          props: {
            children: [
              {
                type: 'foo',
                props: {
                  children: []
                }
              },
              {
                type: 'bar',
                props: {
                  children: []
                }
              },
              {
                type: 'baz',
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

  const [workUnit] = performUnitOfWork(root)
  const [child] = performUnitOfWork(workUnit as Fiber)
  expect(child!.type).toEqual('foo')

  const { sibling } = child as Fiber
  expect(sibling!.type).toEqual('bar')

  const { sibling: sibling2 } = sibling as Fiber
  expect(sibling2!.type).toEqual('baz')
})

afterEach(() => {
  rootScreen.destroy()
  outStream.close()
  inStream.close()
  jest.useRealTimers()
})
