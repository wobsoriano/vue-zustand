# vue-zustand

State-management solution for Vue 3 based on [zustand](https://github.com/pmndrs/zustand).

Vue 2 users can use [this solution](https://gist.github.com/Zikoat/ec47ff3646f889d09f8c6d350e6060f6).

## Install

```sh
npm install zustand vue-zustand
```

## Usage

### First create a store

Your store is a composable! You can put anything in it: primitives, objects, functions. State has to be updated immutably and the set function [merges state](https://github.com/pmndrs/zustand/blob/main/docs/guides/immutable-state-and-merging.md) to help it.

```ts
import create from 'vue-zustand'

interface BearState {
  bears: number
  increase: () => void
}

export const useStore = create<BearState>(set => ({
  bears: 0,
  increase: () => set(state => ({ bears: state.bears + 1 })),
}))
```

### Then bind your components, and that's it!

Use the composable anywhere, no providers are needed.

```vue
<script setup>
import { useStore } from './store'

const bears = useStore(state => state.bears)
</script>

<template>
  <h1>{{ bears }} around here ...</h1>
</template>
```

```vue
<script setup>
import { useStore } from './store'

const increase = useBearStore(state => state.increase)
</script>

<template>
  <button @click="increase">
    one up
  </button>
</template>
```

## Recipes

### Fetching everything

```ts
const state = useStore()
```

## Selecting multiple state slices

```ts
const nuts = useStore(state => state.nuts)
const honey = useStore(state => state.honey)
```

If you want to construct a single object with multiple state-picks inside, similar to redux's mapStateToProps, you can tell zustand that you want the object to be diffed shallowly by passing the `shallow` equality function.

```ts
import shallow from 'zustand/shallow'

// Object pick, updates either state.bears or state.bulls change
const { bears, bulls } = useStore(
  state => ({ bears: state.bears, bulls: state.bulls }),
  shallow,
)

// Array pick, updates either state.bears or state.bulls change
const [bears, bulls] = useStore(state => [state.bears, state.bulls], shallow)
```

## Nuxt

```ts
export default defineNuxtPlugin((nuxtApp) => {
  if (process.server) {
    nuxtApp.hooks.hook('app:rendered', () => {
      const initialState = JSON.parse(JSON.stringify(useStore.getState()))
      nuxtApp.payload.zustand = initialState
    })
  }

  if (process.client) {
    nuxtApp.hooks.hook('app:created', () => {
      useStore.setState({
        ...useStore.getState(),
        ...nuxtApp.payload.zustand,
      })
    })
  }
})
```

## License

MIT License © 2022 [Robert Soriano](https://github.com/wobsoriano)
