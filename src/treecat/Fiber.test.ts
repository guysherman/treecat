import * as blessed from 'blessed'
import * as fs from 'fs'
import { Fiber, performUnitOfWork } from './Fiber'

let rootScreen: blessed.Widgets.Screen
let outStream: fs.WriteStream
let inStream: fs.ReadStream

beforeEach(() => {
  jest.useFakeTimers()
  outStream = fs.createWriteStream('./.scratch/out')
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

  // We expect a newly returned unit of work to be without a dom
  const [workUnit] = performUnitOfWork(root)
  expect(workUnit!.dom === undefined).toBe(true)

  // We expect the navigation to children to work recursively
  // and we expect the unit of work we just worked on to
  // now have a dom
  const [child] = performUnitOfWork(workUnit as Fiber)
  expect(child!.type).toEqual('foo')
  expect(workUnit!.dom === undefined).toBe(false)

  // We expect the array of children to have been transformed
  // into a linked list
  const { sibling } = child as Fiber
  const { sibling: sibling2 } = sibling as Fiber
  expect(sibling!.type).toEqual('bar')
  expect(sibling2!.type).toEqual('baz')

  // When there are no more children, but there are siblings
  // we expect performUnitOfWork to return the sibling
  const [siblingRound2] = performUnitOfWork(child as Fiber)
  expect(siblingRound2 === sibling).toBe(true)
})

afterEach(() => {
  rootScreen.destroy()
  outStream.close()
  inStream.close()
  jest.useRealTimers()
})
