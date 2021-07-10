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
