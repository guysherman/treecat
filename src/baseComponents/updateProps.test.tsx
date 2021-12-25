import * as blessed from 'blessed';
import fs from 'fs';
import { Fiber } from '../Fiber';
import { updateProps } from './updateProps';

let rootScreen: blessed.Widgets.Screen;
let outStream: fs.WriteStream;
let inStream: fs.ReadStream;

describe('effectTag: update', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    outStream = fs.createWriteStream('./.scratch/out');
    inStream = fs.createReadStream('/dev/random');
    rootScreen = blessed.screen({ output: inStream, input: outStream });
  });

  afterEach(() => {
    rootScreen.destroy();
    outStream.close();
    inStream.close();
    jest.useRealTimers();
  });

  it('updateProps - list with selected and an event changed', () => {
    // First we set up the dom
    const bList = blessed.list({ items: ['a', 'b'] });
    const bList2 = blessed.list({ items: ['a', 'b'] });
    rootScreen.append(bList);

    // Now we set up a fiber tree to match
    const root: Fiber = {
      dom: rootScreen,
      effects: [],
      effectCleanups: [],
      props: {
        children: [],
      },
    };

    const mock = jest.fn();

    const fc: Fiber = {
      type: () => [],
      props: {
        children: [],
      },
      parent: root,
      effectTag: 'UPDATE',
      effects: [],
      effectCleanups: [mock],
    };
    root.props.children?.push(fc);
    root.child = fc;

    const oldb: Fiber = {
      dom: bList,
      type: 'list',
      effects: [],
      effectCleanups: [],
      props: {
        selected: 0,
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        'onselect item': () => {},
        children: [],
      },
      parent: fc,
    };

    const b: Fiber = {
      dom: bList2,
      type: 'list',
      alternate: oldb,
      effectTag: 'UPDATE',
      effects: [],
      effectCleanups: [],
      props: {
        selected: 1,
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        'onselect item': () => {},
        children: [],
      },
      parent: fc,
    };
    fc.props.children?.push(b);
    fc.child = b;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((bList as any).selected).toBe(0);
    const updated = updateProps(b);
    expect(updated).toBeTruthy();

    expect(b.dom).toBe(bList);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((bList as any).selected).toBe(1);
  });

  it('commitWork - list with a non-allowed prop changed', () => {
    // First we set up the dom
    const bList = blessed.list({ items: ['a', 'b'] });
    const bList2 = blessed.list({ items: ['a', 'b'] });
    rootScreen.append(bList);

    // Now we set up a fiber tree to match
    const root: Fiber = {
      dom: rootScreen,
      effects: [],
      effectCleanups: [],
      props: {
        children: [],
      },
    };

    const mock = jest.fn();

    const fc: Fiber = {
      type: () => [],
      props: {
        children: [],
      },
      parent: root,
      effectTag: 'UPDATE',
      effects: [],
      effectCleanups: [mock],
    };
    root.props.children?.push(fc);
    root.child = fc;

    const oldb: Fiber = {
      dom: bList,
      type: 'list',
      effects: [],
      effectCleanups: [],
      props: {
        items: ['a'],
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        'onselect item': () => {},
        fizzle: 'bizzle',
        children: [],
      },
      parent: fc,
    };

    const b: Fiber = {
      dom: bList2,
      type: 'list',
      alternate: oldb,
      effectTag: 'UPDATE',
      effects: [],
      effectCleanups: [],
      props: {
        items: ['a', 'b'],
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        'onselect item': () => {},
        fizzle: 'dizzle',
        children: [],
      },
      parent: fc,
    };
    fc.props.children?.push(b);
    fc.child = b;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((bList as any).selected).toBe(0);
    const updated = updateProps(b);
    expect(updated).toBeFalsy();

    expect(b.dom).toBe(bList2);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((bList2 as any).items).toHaveLength(2);
  });
});
