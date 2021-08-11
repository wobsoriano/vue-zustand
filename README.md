# vue-zustand

State management for Vue using [zustand](https://github.com/pmndrs/zustand).

## Install

```sh
yarn add vue-zustand
```

## Example

```jsx
import create from 'vue-zustand'

interface BearState {
  bears: number
  increase: () => void
}

const useStore = create<BearState>(set => ({
  bears: 0,
  increase: () => set(state => ({ bears: state.bears + 1 }))
}))

function BearCounter() {
  const state = useStore()
  return <h1>{state.bears} around here ...</h1>
}

function Controls() {
  const state = useStore()
  return (
    <>
      <button onClick={state.increase}>one up</button>
      {/* Or */}
      <button onClick={() => useStore.setState((prev) => ({ bears: prev.bears + 1 }))}>
        one up
      </button>
    </>
  )
}
```

## Selecting multiple state slices

```ts
const bears = useStore(state => state.bears)
const bulls = useStore(state => state.bulls)
```

Multiple state-picks also works

```ts
import { shallow } from 'vue-zustand'

// Object pick, either state.bears or state.bulls change
const { bears, bulls } = useStore(state => ({ bears: state.bears, bulls: state.bulls }), shallow)

// Array pick, either state.bears or state.bulls change
const [bears, bulls] = useStore(state => [state.bears, state.bulls], shallow)
```

## License

MIT License © 2021 [Robert Soriano](https://github.com/wobsoriano)