/** @jsx TreeCat.createElement **/
import * as blessed from 'blessed'
import * as TreeCat from './index'
import * as fs from 'fs'

let rootScreen: blessed.Widgets.Screen
let outStream: fs.WriteStream
let inStream: fs.ReadStream

beforeEach(() => {
  jest.useFakeTimers()
  outStream = fs.createWriteStream('./out')
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

afterEach(() => {
  rootScreen.destroy()
  outStream.close()
  inStream.close()
  jest.useRealTimers()
})
