# Treecat

A react-like wrapper around https://github.com/chjj/blessed

*WARNING!!* This is a very early/rough project right now, the update implementation is far from complete, which makes it pretty hard to use stuff I haven't already handled.

Issues and comments welcome :)

## Get Started

### Install treecat and its peer dependencies
```
npm i @guysherman/treecat blessed @types/blessed
```

### Basic use-case

```
/** @jsx TreeCat.createElement **/
import * as TreeCat from '@guysherman/treecat';
import * as blessed from 'blessed';
import { MainScreen } from './screens/MainScreen';

const main = async () => {
  const rootScreen: blessed.Widgets.Screen = TreeCat.createRootScreen();
  rootScreen.program.on('keypress', (_ch: string, key: blessed.Widgets.Events.IKeyEventArg) => {
    if (key.full === 'C-c') {
      process.exit(0);
    }
  });

  TreeCat.render(<box>Hello Treecat</box>, rootScreen);
};

main().catch((e) => {
  console.error('Fatal Error', { error: e });
  process.exit(1);
});

```
### More Advanced Use-cases

See [kittymux](https://github.com/guysherman/kittymux) for a slightly more advanced use-case

## Tests

```
yarn test
```

## Build
```
yarn build
```

## Using locally

From here:
```
yarn link
```
Then in the project that uses treecat (assuming you've already added treecat as a dep)

```
yarn link treecat
```


