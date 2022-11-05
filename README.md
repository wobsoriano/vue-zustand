# vue-zustand

State-management solution for Vue based on [zustand](https://github.com/pmndrs/zustand).

## Install

```sh
pnpm add zustand vue-zustand
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
  increase: () => set(state => ({ bears: state.bears + 1 })),
}))
```

```html
<!-- Component.vue -->
<script setup lang="ts">
  import { useStore } from './store'

  const { bears, increase } = useStore()

  // bears.value
  // increase.value()
</script>

<template>
  <h1>{{ bears }} around here ...</h1>
  <button @click="increase">one up</button>
</template>
```

## Selecting multiple state slices

```ts
const bears = useStore(state => state.bears) // bears.value
const bulls = useStore(state => state.bulls) // bulls.value
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
