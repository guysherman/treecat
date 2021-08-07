import * as blessed from 'blessed'
import * as fs from 'fs'
import { Fiber } from './Fiber'
import { performUnitOfWork } from './FiberTree'

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

  const setWipFiber = jest.fn()
  const [workUnit] = performUnitOfWork(root, setWipFiber)
  expect(workUnit!.type).toEqual('box')
  expect(workUnit!.effectTag).toEqual('PLACEMENT')

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

  const setWipFiber = jest.fn()

  // We expect a newly returned unit of work to be without a dom
  const [workUnit] = performUnitOfWork(root, setWipFiber)
  expect(workUnit!.dom === undefined).toBe(true)

  // We expect the navigation to children to work recursively
  // and we expect the unit of work we just worked on to
  // now have a dom
  const [child] = performUnitOfWork(workUnit as Fiber, setWipFiber)
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
  const [siblingRound2] = performUnitOfWork(child as Fiber, setWipFiber)
  expect(siblingRound2 === sibling).toBe(true)
})

test('1 box -> 1 box => 1 update', () => {
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

  const setWipFiber = jest.fn()

  const [box] = performUnitOfWork(root as Fiber, setWipFiber)
  performUnitOfWork(box as Fiber, setWipFiber)

  const secondRoot = {
    dom: rootScreen,
    alternate: root,
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

  const [box2] = performUnitOfWork(secondRoot as Fiber, setWipFiber)
  expect(box2!.type).toEqual('box')
  expect(box2!.alternate === box).toBe(true)
  expect(box2!.effectTag).toEqual('UPDATE')
})

test('1 box -> 0 boxes => 1 deletion', () => {
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

  const setWipFiber = jest.fn()

  const [box] = performUnitOfWork(root as Fiber, setWipFiber)
  performUnitOfWork(box as Fiber, setWipFiber)

  const secondRoot = {
    dom: rootScreen,
    alternate: root,
    props: {
      children: [
      ]
    }
  }

  const [box2, deletions] = performUnitOfWork(secondRoot as Fiber, setWipFiber)
  expect(box2 === null).toBe(true)
  expect(deletions.length).toBe(1)

  const [del] = deletions
  expect(del === box).toBe(true)
  expect(del.effectTag).toEqual('DELETION')
})

test('1 box(foo,bar,baz) -> 1 box(foo, bar) => 1 update(update, update, delete)', () => {
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

  const setWipFiber = jest.fn()

  let nuw: Fiber | null = root
  const deletions: Fiber[] = []
  while (nuw) {
    const [wu, ld] = performUnitOfWork(nuw as Fiber, setWipFiber)
    deletions.push(...ld)
    nuw = wu
  }

  expect(deletions.length).toBe(0)

  const secondRoot = {
    dom: rootScreen,
    alternate: root,
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
              }
            ]
          }
        }
      ]
    }
  }

  nuw = secondRoot
  while (nuw) {
    const [wu, ld] = performUnitOfWork(nuw as Fiber, setWipFiber)
    deletions.push(...ld)
    nuw = wu
  }

  expect(deletions.length).toBe(1)
  const { child: box } = secondRoot as Fiber
  expect(box!.type).toEqual('box')
  expect(box!.effectTag).toEqual('UPDATE')

  const { child: foo } = box as Fiber
  expect(foo!.type).toEqual('foo')
  expect(foo!.effectTag).toEqual('UPDATE')

  const { sibling: bar } = foo as Fiber
  expect(bar!.type).toEqual('bar')
  expect(bar!.effectTag).toEqual('UPDATE')

  const [baz] = deletions
  expect(baz!.type).toEqual('baz')
  expect(baz!.effectTag).toEqual('DELETION')
})

test('1 box(foo,bar,baz) -> 1 box(foo, baz) => 1 update(update, placement, delete, delete)', () => {
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

  const setWipFiber = jest.fn()

  let nuw: Fiber | null = root
  const deletions: Fiber[] = []
  while (nuw) {
    const [wu, ld] = performUnitOfWork(nuw as Fiber, setWipFiber)
    deletions.push(...ld)
    nuw = wu
  }

  expect(deletions.length).toBe(0)

  const secondRoot = {
    dom: rootScreen,
    alternate: root,
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

  nuw = secondRoot
  while (nuw) {
    const [wu, ld] = performUnitOfWork(nuw as Fiber, setWipFiber)
    deletions.push(...ld)
    nuw = wu
  }

  expect(deletions.length).toBe(2)
  const { child: box } = secondRoot as Fiber
  expect(box!.type).toEqual('box')
  expect(box!.effectTag).toEqual('UPDATE')

  const { child: foo } = box as Fiber
  expect(foo!.type).toEqual('foo')
  expect(foo!.effectTag).toEqual('UPDATE')

  const { sibling: baz } = foo as Fiber
  expect(baz!.type).toEqual('baz')
  expect(baz!.effectTag).toEqual('PLACEMENT')

  const [bar, oldBaz] = deletions
  expect(bar!.type).toEqual('bar')
  expect(bar!.effectTag).toEqual('DELETION')
  expect(oldBaz!.type).toEqual('baz')
  expect(oldBaz!.effectTag).toEqual('DELETION')
})

