import * as blessed from 'blessed'
import fs from 'fs'
import { commitWork, createDom } from './Dom'
import { Fiber } from './Fiber'

let rootScreen: blessed.Widgets.Screen
let outStream: fs.WriteStream
let inStream: fs.ReadStream

beforeEach(() => {
  jest.useFakeTimers()
  outStream = fs.createWriteStream('./.scratch/out')
  inStream = fs.createReadStream('/dev/random')
  rootScreen = blessed.screen({ output: inStream, input: outStream })
})

test('createDom - screen - should throw', () => {
  const f: Fiber = { type: 'screen', props: { children: [] } }

  expect(() => { createDom(f) }).toThrow('Creating screens via JSX is not supported')
})


test('createDom - box', () => {
  const f: Fiber = {
    type: 'box',
    props: {
      top: 'center',
      left: 'center',
      children: []
    }
  }

  const node: blessed.Widgets.Node | null = createDom(f) ?? null


  const box: blessed.Widgets.BoxElement | null = node as blessed.Widgets.BoxElement ?? null
  expect(box).toBeTruthy()

  expect(box.options.top).toEqual('center')
  expect(box.options.left).toEqual('center')
})

test('createDom - orphan text - should throw', () => {
  const f: Fiber = {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: 'Some Text',
      children: []
    }
  }

  expect(() => { createDom(f) }).toThrow('Text can only exist as a child of a BlessedElement')
})

test('createDom - box with text', () => {
  const f: Fiber = {
    type: 'box',
    props: {
      top: 'center',
      left: 'center',
      children: []
    }
  }

  const g: Fiber = {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: 'Some Text',
      children: []
    }
  }

  f.props.children.push(g)
  f.child = g
  g.parent = f

  f.dom = createDom(f)
  g.dom = createDom(g)
  const box: blessed.Widgets.BoxElement | null = f.dom as blessed.Widgets.BoxElement ?? null

  expect(box!.content).toEqual('Some Text')
})

test('createDom - box with event', () => {
  let i: number = 0

  const keypress: any = (_ch: string, key: blessed.Widgets.Events.IKeyEventArg) => {
    if (key.full === 'S-a') {
      i++
    }
  }

  const f: Fiber = {
    type: 'box',
    props: {
      onkeypress: keypress,
      children: []
    }
  }

  const node: blessed.Widgets.Node | null = createDom(f) ?? null

  node!.emit('keypress', 'A', { sequence: 'A', name: 'a', ctrl: false, meta: false, shift: true, full: 'S-a' })
  jest.runAllTimers()
  expect(i).toBe(1)
})

test('commitWork - simple box - placement', () => {
  const a: Fiber = {
    dom: rootScreen,
    props: {
      children: []

    }
  }

  const b: Fiber = {
    dom: blessed.box(),
    props: {
      children: []
    },
    parent: a,
    effectTag: 'PLACEMENT'
  }

  a.props.children.push(b)
  a.child = b
  expect(rootScreen.children.length).toBe(0)

  commitWork(b)
  expect(rootScreen.children.length).toBe(1)

  const correctChild: boolean = rootScreen.children[0] === b.dom
  expect(correctChild).toBe(true)
})

test('commitWork - box with child - update', () => {
  const bBox = blessed.box()
  const bBoxChild = blessed.box()
  bBox.append(bBoxChild)
  rootScreen.append(bBox)

  const a: Fiber = {
    dom: rootScreen,
    props: {
      children: []

    }
  }

  const bOrig: Fiber = {
    dom: bBox,
    props: {
      children: []
    },
    parent: a,
    effectTag: 'PLACEMENT'
  }

  const b: Fiber = {
    dom: blessed.box(),
    props: {
      children: []
    },
    parent: a,
    alternate: bOrig,
    effectTag: 'UPDATE'
  }

  a.props.children.push(b)
  a.child = b
  expect(rootScreen.children.length).toBe(1)

  commitWork(b)
  expect(rootScreen.children.length).toBe(1)

  const correctChild: boolean = rootScreen.children[0] === b.dom
  expect(correctChild).toBe(true)

  const notBBox: boolean = b.dom !== bBox
  expect(notBBox).toBe(true)

  const childrenReplaced: boolean = b!.dom!.children[0] === bBoxChild
  expect(childrenReplaced).toBe(true)
})

test('commitWork - simple box - delete', () => {
  const bBox = blessed.box()
  rootScreen.append(bBox)

  const a: Fiber = {
    dom: rootScreen,
    props: {
      children: []

    }
  }

  const b: Fiber = {
    dom: bBox,
    props: {
      children: []
    },
    parent: a,
    effectTag: 'DELETION'
  }

  a.props.children.push(b)
  a.child = b
  expect(rootScreen.children.length).toBe(1)

  commitWork(b)
  expect(rootScreen.children.length).toBe(0)
})

test('commitWork - simple function component - placement', () => {
  const root: Fiber = {
    dom: rootScreen,
    props: {
      children: []
    }
  }

  const fc: Fiber = {
    type: () => {},
    props: {
      children: []
    },
    parent: root
  }
  root.props.children.push(fc)
  root.child = fc

  const b: Fiber = {
    type: 'box',
    dom: blessed.box(),
    props: {
      children: []
    },
    parent: fc,
    effectTag: 'PLACEMENT'
  }
  fc.props.children.push(b)
  fc.child = b
  expect(rootScreen.children.length).toBe(0)

  commitWork(b)
  expect(rootScreen.children.length).toBe(1)

  const correctChild: boolean = rootScreen.children[0] === b.dom
  expect(correctChild).toBe(true)
})

test('commitWork - simple function component - delete', () => {
  const bBox = blessed.box()
  rootScreen.append(bBox)

  const root: Fiber = {
    dom: rootScreen,
    props: {
      children: []

    }
  }

  const fc: Fiber = {
    type: () => {},
    props: {
      children: []
    },
    parent: root,
    effectTag: 'DELETION'
  }
  root.props.children.push(fc)
  root.child = fc

  const b: Fiber = {
    dom: bBox,
    props: {
      children: []
    },
    parent: fc
  }
  fc.props.children.push(b)
  fc.child = b

  expect(rootScreen.children.length).toBe(1)

  commitWork(fc)
  expect(rootScreen.children.length).toBe(0)
})

afterEach(() => {
  rootScreen.destroy()
  outStream.close()
  inStream.close()
  jest.useRealTimers()
})

