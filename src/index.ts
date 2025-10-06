import type { ExtractState, Mutate, StateCreator, StoreApi, StoreMutatorIdentifier } from 'zustand/vanilla'
import type { IsPrimitive } from './util'

import { toReactive } from '@vueuse/core'
import { getCurrentInstance, onScopeDispose, readonly, ref, toRefs } from 'vue'
import { createStore } from 'zustand/vanilla'
import { isPrimitive } from './util'

type ReadonlyStoreApi<T> = Pick<
  StoreApi<T>,
  'getState' | 'getInitialState' | 'subscribe'
>

const identity = <T>(arg: T): T => arg
export function useStore<S extends ReadonlyStoreApi<unknown>>(
  api: S,
): ExtractState<S>

export function useStore<S extends ReadonlyStoreApi<unknown>, U>(
  api: S,
  selector: (state: ExtractState<S>) => U,
): U

export function useStore<TState, StateSlice>(
  api: ReadonlyStoreApi<TState>,
  selector: (state: TState) => StateSlice = identity as any,
) {
  const initialValue = selector(api.getState())

  if (typeof initialValue === 'function')
    return initialValue

  const state = ref(initialValue)

  const listener = (nextState: TState) => {
    state.value = selector(nextState)
  }

  const unsubscribe = api.subscribe(listener)

  if (getCurrentInstance()) {
    onScopeDispose(() => {
      unsubscribe()
    })
  }

  return isPrimitive(state.value) ? readonly(state) : toRefs(toReactive(state))
}

export type UseBoundStore<S extends ReadonlyStoreApi<unknown>> = {
  (): ExtractState<S> extends (...args: any[]) => any ? ExtractState<S> : IsPrimitive<ExtractState<S>>
  <U>(selector: (state: ExtractState<S>) => U): U extends (...args: any[]) => any ? U : IsPrimitive<IsPrimitive<U>>
} & S

interface Create {
  <T, Mos extends [StoreMutatorIdentifier, unknown][] = []>(
    initializer: StateCreator<T, [], Mos>,
  ): UseBoundStore<Mutate<StoreApi<T>, Mos>>
  <T>(): <Mos extends [StoreMutatorIdentifier, unknown][] = []>(
    initializer: StateCreator<T, [], Mos>,
  ) => UseBoundStore<Mutate<StoreApi<T>, Mos>>
}

function createImpl<T>(createState: StateCreator<T, [], []>) {
  const api = createStore(createState)

  const useBoundStore: any = (selector?: any) => useStore(api, selector)

  Object.assign(useBoundStore, api)

  return useBoundStore
}

export const create = (<T>(createState: StateCreator<T, [], []> | undefined) =>
  createState ? createImpl(createState) : createImpl) as Create
