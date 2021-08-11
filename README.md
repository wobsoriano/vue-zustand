# vue-zustand

State management for Vue using [zustand](https://github.com/pmndrs/zustand).

Demo: https://codesandbox.io/s/vue-zustand-demo-w7pcx

## Install

```sh
yarn add vue-zustand
```

## Example

```ts
// store.ts
import create from 'vue-zustand'

interface BearState {
  bears: number
  increase: () => void
}

export const useStore = create<BearState>(set => ({
  bears: 0,
  increase: () => set(state => ({ bears: state.bears + 1 }))
}))
```

```html
<!-- Component.vue -->
<template>
    <h1>{{ state.bears }} around here ...</h1>
    <button @click="state.increase">one up</button>
</template>

<script setup lang="ts">
import { useStore } from './store'

const state = useStore()
</script>
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
