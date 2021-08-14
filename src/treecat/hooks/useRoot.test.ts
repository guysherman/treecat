import * as blessed from 'blessed'
import fs from 'fs'
import { RendererContext } from '../RendererContext'
import { createHook } from './useRoot'

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

test('should return context.blessedRoot', () => {
  const getContext = () => {
    return {
      blessedRoot: rootScreen
    } as RendererContext
  }

  const useRoot = createHook(getContext)
  expect(useRoot()).toEqual(rootScreen)
})
