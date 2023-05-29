import type { UnwrapRef } from 'vue'
import { getCurrentInstance, onScopeDispose, readonly, ref, toRefs } from 'vue'
import { toReactive } from '@vueuse/core'

import type {
  Mutate,
  StateCreator,
  StoreApi,
  StoreMutatorIdentifier,
} from 'zustand/vanilla'
import { createStore as createZustandStore } from 'zustand/vanilla'
import type { IsPrimitive } from './util'
import { isPrimitive } from './util'

type ExtractState<S> = S extends { getState: () => infer T } ? T : never

export function useStore<S extends StoreApi<unknown>>(api: S): ExtractState<S>

export function useStore<S extends StoreApi<unknown>, U>(
  api: S,
  selector: (state: ExtractState<S>) => U,
  equalityFn?: (a: U, b: U) => boolean
): U

export function useStore<TState extends object, StateSlice>(
  api: StoreApi<TState>,
  selector: (state: TState) => StateSlice = api.getState as any,
  equalityFn?: (a: StateSlice, b: StateSlice) => boolean,
) {
  const initialValue = selector(api.getState())
  const state = ref(initialValue)

  const listener = (nextState: TState, previousState: TState) => {
    const prevStateSlice = selector(previousState)
    const nextStateSlice = selector(nextState)

    if (equalityFn !== undefined) {
      if (!equalityFn(prevStateSlice, nextStateSlice))
        state.value = nextStateSlice as UnwrapRef<StateSlice>
    }
    else {
      state.value = nextStateSlice as UnwrapRef<StateSlice>
    }
  }

  const unsubscribe = api.subscribe(listener)

  if (getCurrentInstance()) {
    onScopeDispose(() => {
      unsubscribe()
    })
  }

  return isPrimitive(state.value) ? readonly(state) : toRefs(toReactive(state))
}

export type UseBoundStore<S extends StoreApi<unknown>> = {
  (): IsPrimitive<ExtractState<S>>
  <U>(
    selector: (state: ExtractState<S>) => U,
    equals?: (a: U, b: U) => boolean
  ): IsPrimitive<U>
} & S

interface Create {
  <T, Mos extends [StoreMutatorIdentifier, unknown][] = []>(
    initializer: StateCreator<T, [], Mos>
  ): UseBoundStore<Mutate<StoreApi<T>, Mos>>
  <T>(): <Mos extends [StoreMutatorIdentifier, unknown][] = []>(
    initializer: StateCreator<T, [], Mos>
  ) => UseBoundStore<Mutate<StoreApi<T>, Mos>>
  <S extends StoreApi<unknown>>(store: S): UseBoundStore<S>
}

const createImpl = <T extends object>(createState: StateCreator<T, [], []>) => {
  const api
    = typeof createState === 'function' ? createZustandStore(createState) : createState

  const useBoundStore: any = (selector?: any, equalityFn?: any) =>
    useStore(api, selector, equalityFn)

  Object.assign(useBoundStore, api)

  return useBoundStore
}

const create = (<T extends object>(
  createState: StateCreator<T, [], []> | undefined,
) => (createState ? createImpl(createState) : createImpl)) as Create

export default create
