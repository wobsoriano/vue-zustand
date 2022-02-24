# vue-zustand

State-management solution for for Vue based on [zustand](https://github.com/pmndrs/zustand).

## Install

```sh
pnpm add vue-zustand
```

## Example

```ts
// store.ts
import create from 'vue-zustand'

interface BearState {
  bears: number
  increase: () => void
}

export const useStore = create<BearState>((set) => ({
  bears: 0,
  increase: () => set((state) => ({ bears: state.bears + 1 })),
}))
```

```html
<!-- Component.vue -->
<script setup lang="ts">
  import { useStore } from './store'

  const state = useStore()
</script>

<template>
  <h1>{{ state.bears }} around here ...</h1>
  <button @click="state.increase">one up</button>
</template>
```

## Selecting multiple state slices

```ts
const bears = useStore((state) => state.bears)
const bulls = useStore((state) => state.bulls)
```

Multiple state-picks also works

```ts
import shallow from 'zustand/shallow'

// Object pick, either state.bears or state.bulls change
const { bears, bulls } = useStore(
  (state) => ({ bears: state.bears, bulls: state.bulls }),
  shallow
)

// Array pick, either state.bears or state.bulls change
const [bears, bulls] = useStore((state) => [state.bears, state.bulls], shallow)
```

## Suspense

```ts
// store.ts
export const useStore = create((set) => ({
  user: {},
  fetchUser: async (id) => {
    const response = await fetch(
      `https://jsonplaceholder.typicode.com/users/${id}`
    )
    set({ user: await response.json() })
  },
}))
```

```html
<script setup lang="ts">
  import { useStore } from './store'

  const user = useStore((state) => state.user)
  const fetchUser = useStore((state) => state.fetchUser)
  await fetchUser.value('1')
</script>

<template>
  <div>{{ JSON.stringify(user, null, 2) }}</div>
</template>
```

```html
<script setup lang="ts">
  import User from './components/User.vue'
</script>

<template>
  <Suspense>
    <User />
    <template #fallback> Loading... </template>
  </Suspense>
</template>
```

## License

MIT License © 2022 [Robert Soriano](https://github.com/wobsoriano)
