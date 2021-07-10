/** @jsx TreeCat.createElement **/
// eslint-disable-next-line no-unused-vars
import * as TreeCat from './index'

test('box with text', () => {
  const tree = <box>HelloWorld</box>

  expect(tree.type).toEqual('box')
  expect(tree.props).toBeTruthy()
  expect(tree.props.children).toBeTruthy()

  expect(tree.props.children.length).toBe(1)

  const {
    props: {
      children: [
        child
      ]
    }
  } = tree

  expect(child.type).toEqual('TEXT_ELEMENT')
  expect(child.props).toBeTruthy()

  const { props: { nodeValue } } = child

  expect(nodeValue).toEqual('HelloWorld')
})

test('box with props', () => {
  const tree = <box border={'line' as const} width="50%" height="50%" left="center" top="center" />

  const {
    props: {
      border,
      width,
      height,
      left,
      top
    }
  } = tree

  expect(border).toEqual('line')
  expect(width).toEqual('50%')
  expect(height).toEqual('50%')
  expect(left).toEqual('center')
  expect(top).toEqual('center')
})

test('box in a box', () => {
  const tree = <box>
                <box />
              </box>

  const { props: { children: [child] } } = tree

  expect(child.type).toEqual('box')
})
