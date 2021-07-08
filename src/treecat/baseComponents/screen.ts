import * as blessed from 'blessed'
import { TreeCatElement } from '../TreeCatElement'

export type ScreenProps = blessed.Widgets.IScreenOptions & {
  onKeyPress: (ch: string, key: blessed.Widgets.Events.IKeyEventArg) => void
}

export function Screen (_props: ScreenProps) {}

export function createScreen (element: TreeCatElement<ScreenProps>): blessed.Widgets.Screen {
  // eslint-disable-next-line no-unused-vars
  const { onKeyPress, ...screenOptions } = element.props
  const screen = blessed.screen({ ...screenOptions })
  if (onKeyPress) {
    screen.on('keypress', onKeyPress)
  }

  return screen
}
