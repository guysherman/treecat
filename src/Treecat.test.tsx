/** @jsx TreeCat.createElement **/
import * as blessed from 'blessed';
import * as TreeCat from './index';
import * as fs from 'fs';
import { Fragment, useContext, useEffect, useState } from './index';
import { createContext } from './Context';

describe('Treecat', () => {
  let rootScreen: blessed.Widgets.Screen;
  let outStream: fs.WriteStream;
  let inStream: fs.ReadStream;

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

  it('simple box', async () => {
    const tree = <box />;
    TreeCat.render(tree, rootScreen);
    const p: Promise<void> = TreeCat.stopRendering();
    jest.runAllTimers();
    await p.then(() => true);

    const {
      children: [box],
    } = rootScreen;

    expect(box).toBeTruthy();
  });

  // eslint-disable-next-line no-unused-vars
  function TestFC() {
    return <box />;
  }

  it('simple function component', async () => {
    const tree = <TestFC />;
    TreeCat.render(tree, rootScreen);

    const p: Promise<void> = TreeCat.stopRendering();
    jest.runAllTimers();
    await p.then(() => true);

    const {
      children: [box],
    } = rootScreen;

    expect(box).toBeTruthy();
  });

  it('simple counter example', async () => {
    const mockCleanup = jest.fn();
    const mockEffect = jest.fn(() => mockCleanup);
    const Counter = () => {
      const [state, setState] = useState(1);
      useEffect(mockEffect, [state]);

      const kp = (ch: string) => {
        if (ch === '+') {
          setState(state + 1);
        } else if (ch === '-') {
          setState(state - 1);
        }
      };

      return (
        <box>
          <box focused={true} onkeypress={kp}>
            {state}
          </box>
        </box>
      );
    };
    const tree = <Counter />;
    TreeCat.render(tree, rootScreen);

    jest.runOnlyPendingTimers();

    let el = rootScreen.children[0].children[0] as blessed.Widgets.BoxElement;

    expect(el).toBeTruthy();
    expect(el?.content).toEqual('1');

    // el.focus()
    el?.emit('keypress', '+', { sequence: '+', name: '+', ctrl: false, meta: false, shift: true, full: '+' });
    jest.runOnlyPendingTimers();
    jest.runOnlyPendingTimers();
    jest.runOnlyPendingTimers();

    el = rootScreen.children[0].children[0] as blessed.Widgets.BoxElement;
    expect(el?.content).toEqual('2');

    let elStillFocused = el.screen.focused === el;
    expect(elStillFocused).toBe(true);

    el?.emit('keypress', '-', { sequence: '-', name: '-', ctrl: false, meta: false, shift: false, full: '-' });
    jest.runOnlyPendingTimers();
    jest.runOnlyPendingTimers();
    jest.runOnlyPendingTimers();
    el = rootScreen.children[0].children[0] as blessed.Widgets.BoxElement;
    expect(el?.content).toEqual('1');

    elStillFocused = el.screen.focused === el;
    expect(elStillFocused).toBe(true);

    expect(mockEffect).toHaveBeenCalledTimes(3);
    expect(mockCleanup).toHaveBeenCalledTimes(2);
  });

  const TestFragmentFc = () => {
    return (
      <Fragment>
        <box />
      </Fragment>
    );
  };

  it('simple fragment example', async () => {
    const tree = <TestFragmentFc />;
    TreeCat.render(tree, rootScreen);

    const p: Promise<void> = TreeCat.stopRendering();
    jest.runAllTimers();
    await p.then(() => true);

    const {
      children: [box],
    } = rootScreen;

    expect(box).toBeTruthy();
  });

  const context = createContext('Default Text');
  const TestUseContextInner = () => {
    const textContent = useContext(context);
    return <box>{textContent}</box>;
  };

  const TestUseContextTop = () => {
    return (
      <context.Provider value={'Real Text'}>
        <TestUseContextInner />
      </context.Provider>
    );
  };

  it('simple context example', async () => {
    const tree = <TestUseContextTop />;
    TreeCat.render(tree, rootScreen);

    const p: Promise<void> = TreeCat.stopRendering();
    jest.runAllTimers();
    await p.then(() => true);

    const {
      children: [box],
    } = rootScreen;
    expect(box).toBeTruthy();
    expect((box as blessed.Widgets.BoxElement).content).toEqual('Real Text');
  });

  const TestMap = () => {
    const items = ['a', 'b', 'c'];
    return (
      <box>
        {items.map((item, index) => (
          <box top={index}>{item}</box>
        ))}
      </box>
    );
  };

  it('should render the result of a map', async () => {
    const tree = <TestMap />;
    TreeCat.render(tree, rootScreen);

    const p: Promise<void> = TreeCat.stopRendering();
    jest.runAllTimers();
    await p.then(() => true);

    const {
      children: [box],
    } = rootScreen;
    expect(box).toBeTruthy();
    expect((box as blessed.Widgets.BoxElement).children).toHaveLength(3);
  });
});
