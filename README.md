# vue-zustand

State-management solution for Vue based on [zustand](https://github.com/pmndrs/zustand).

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

const increase = useStore(state => state.increase)
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

You can also construct a single object with multiple state-picks inside, similar to redux's mapStateToProps:

```ts
// Object pick, updates either state.bears or state.bulls change
const { bears, bulls } = useStore(state => ({ bears: state.bears, bulls: state.bulls }))

// Array pick, updates either state.bears or state.bulls change
const [bears, bulls] = useStore(state => [state.bears, state.bulls])
```

## Nuxt

To support SSR, follow these Nuxt plugin instructions:

```ts
// plugins/zustand.ts
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

MIT
