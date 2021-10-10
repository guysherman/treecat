import { ElementDescription } from '../ElementDescription'

type FragmentProps = {
  children: ElementDescription[] | ElementDescription;
}

function isElementDescriptionArray (children: ElementDescription[] | ElementDescription): children is ElementDescription[] {
  return (children as ElementDescription[]).length !== undefined
}

export function Fragment ({ children }: FragmentProps): ElementDescription[] {
  if (isElementDescriptionArray(children)) {
    return children
  } else {
    return [children]
  }
}
