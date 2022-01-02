import * as blessed from 'blessed';
import { TreecatElement } from './types';
import { Fiber } from './Fiber';
import { RendererContext } from './RendererContext';
import { performUnitOfWork } from './FiberTree';
import { commitWork } from './Dom';
import { createHook as createUseState } from './hooks/useState';
import { createHook as createUseEffect } from './hooks/useEffect';
import { createHook as createUseRoot } from './hooks/useRoot';
import { createHook as createUseContext } from './hooks/useContext';
import { createHook as createUseReducer } from './hooks/useReducer';
export { createElement, JSX } from './jsx';
export { Fragment } from './baseComponents';
export {
  TreecatElement,
  TreecatNode,
  ContextProviderProps,
  Context,
  ContextElement,
  TypedContextElement,
  BaseReducer,
  Reducer,
  FC,
} from './types';
export { createContext } from './Context';
export { blessed };

const createRendererContext = () => {
  return {
    nextUnitOfWork: null,
    wipRoot: null,
    wipFiber: null,
    currentRoot: null,
    blessedRoot: null,
    deletions: [],
    shouldStopWorkloop: false,
    workLoopResolve: null,
  };
};

let context: RendererContext;

export const useState = createUseState(getContext);
export const useEffect = createUseEffect(getContext);
export const useRoot = createUseRoot(getContext);
export const useContext = createUseContext(getContext);
export const useReducer = createUseReducer(getContext);

export function createRootScreen(): blessed.Widgets.Screen {
  const rootScreen: blessed.Widgets.Screen = blessed.screen({
    sendFocus: true,
    smartCSR: true,
  });
  return rootScreen;
}

export function render(element: TreecatElement, container: blessed.Widgets.Screen) {
  context = createRendererContext();
  context.blessedRoot = container;
  context.wipRoot = {
    hookIndex: 0,
    dom: container,
    props: {
      children: [element],
    },
    alternate: context.currentRoot,
    effects: [],
    effectCleanups: [],
  };

  context.shouldStopWorkloop = false;
  context.nextUnitOfWork = context.wipRoot;
  setImmediate(workLoop);
}

export async function stopRendering(): Promise<void> {
  context.shouldStopWorkloop = true;
  const p = new Promise<void>((resolve) => {
    context.workLoopResolve = resolve;
  });
  return p;
}

function workLoop() {
  while (context.nextUnitOfWork) {
    const [workUnit, localDeletions] = performUnitOfWork(context.nextUnitOfWork, setWipFiber);
    context.deletions.push(...localDeletions);
    context.nextUnitOfWork = workUnit;
  }

  if (!context.nextUnitOfWork && context.wipRoot) {
    commitRoot();
  }

  if (!context.nextUnitOfWork && !context.wipRoot && context.shouldStopWorkloop) {
    if (context.workLoopResolve) {
      context.workLoopResolve();
    }
  } else {
    setTimeout(() => workLoop(), 30);
  }
}

function setWipFiber(fiber: Fiber | null): void {
  context.wipFiber = fiber;
}

function getContext(): RendererContext {
  return context;
}

function commitRoot() {
  context.deletions.forEach(commitWork);
  commitWork(context.wipRoot?.child ?? null);
  context.currentRoot = context.wipRoot;
  context.blessedRoot?.render();
  context.wipRoot = null;
}
