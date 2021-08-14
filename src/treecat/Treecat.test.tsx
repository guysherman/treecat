/** @jsx TreeCat.createElement **/
import * as blessed from 'blessed'
import * as TreeCat from './index'
import * as fs from 'fs'
import { useEffect, useState } from './index'

let rootScreen: blessed.Widgets.Screen
let outStream: fs.WriteStream
let inStream: fs.ReadStream

beforeEach(() => {
  jest.useFakeTimers()
  outStream = fs.createWriteStream('./.scratch/out')
  inStream = fs.createReadStream('/dev/random')
  rootScreen = blessed.screen({ output: inStream, input: outStream })
})

test('simple box', async () => {
  const tree = <box />
  TreeCat.render(tree, rootScreen)
  const p: Promise<void> = TreeCat.stopRendering()
  jest.runAllTimers()
  await p.then(() => true)

  const { children: [box] } = rootScreen

  expect(box).toBeTruthy()
})

// eslint-disable-next-line no-unused-vars
function TestFC () {
  return <box />
}

test('simple function component', async () => {
  const tree = <TestFC />
  TreeCat.render(tree, rootScreen)

  const p: Promise<void> = TreeCat.stopRendering()
  jest.runAllTimers()
  await p.then(() => true)

  const { children: [box] } = rootScreen

  expect(box).toBeTruthy()
})


test('simple counter example', async () => {
  const mockCleanup = jest.fn()
  const mockEffect = jest.fn(() => mockCleanup)
  const Counter = () => {
    const [state, setState] = useState(1)
    useEffect(mockEffect, [state])

    const kp = (ch: string, _key: any) => {
      if (ch === '+') {
        setState((s: number) => s + 1)
      } else if (ch === '-') {
        setState((s: number) => s - 1)
      }
    }

    return <box><box focused={true} onkeypress={kp}>{ state }</box></box>
  }
  const tree = <Counter />
  TreeCat.render(tree, rootScreen)

  jest.runOnlyPendingTimers()

  let el = rootScreen.children[0].children[0] as blessed.Widgets.BoxElement

  expect(el).toBeTruthy()
  expect(el!.content).toEqual('1')

  // el.focus()
  el!.emit('keypress', '+', { sequence: '+', name: '+', ctrl: false, meta: false, shift: true, full: '+' })
  jest.runOnlyPendingTimers()
  jest.runOnlyPendingTimers()
  jest.runOnlyPendingTimers()

  el = rootScreen.children[0].children[0] as blessed.Widgets.BoxElement
  expect(el!.content).toEqual('2')

  let elStillFocused = el.screen.focused === el
  expect(elStillFocused).toBe(true)

  el!.emit('keypress', '-', { sequence: '-', name: '-', ctrl: false, meta: false, shift: false, full: '-' })
  jest.runOnlyPendingTimers()
  jest.runOnlyPendingTimers()
  jest.runOnlyPendingTimers()
  el = rootScreen.children[0].children[0] as blessed.Widgets.BoxElement
  expect(el!.content).toEqual('1')

  elStillFocused = el.screen.focused === el
  expect(elStillFocused).toBe(true)

  expect(mockEffect).toHaveBeenCalledTimes(3)
  expect(mockCleanup).toHaveBeenCalledTimes(2)
})

afterEach(() => {
  rootScreen.destroy()
  outStream.close()
  inStream.close()
  jest.useRealTimers()
})
