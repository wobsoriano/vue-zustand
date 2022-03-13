import type { ToRefs } from 'vue'
import { getCurrentInstance, onUnmounted, reactive, readonly, toRefs } from 'vue'
import type {
  EqualityChecker,
  GetState,
  SetState,
  State,
  StateCreator,
  StateSelector,
  StoreApi,
} from 'zustand/vanilla'
import createImpl from 'zustand/vanilla'
import { updateState } from './utils'

type UseBoundStore<
  T extends State,
  CustomStoreApi extends StoreApi<T> = StoreApi<T>,
> = {
  (): ToRefs<T>
  <U>(selector: StateSelector<T, U>, equalityFn?: EqualityChecker<U>): ToRefs<U>
} & CustomStoreApi

export default function create<
  TState extends State,
  CustomSetState = SetState<TState>,
  CustomGetState = GetState<TState>,
  CustomStoreApi extends StoreApi<TState> = StoreApi<TState>,
>(
  createState:
  | StateCreator<TState, CustomSetState, CustomGetState, CustomStoreApi>
  | CustomStoreApi,
): UseBoundStore<TState, CustomStoreApi> {
  const api: StoreApi<TState>
    = typeof createState === 'function' ? createImpl(createState) : createState

  const useStore: any = <StateSlice>(
    selector: StateSelector<TState, StateSlice> = api.getState as any,
    equalityFn: EqualityChecker<StateSlice> = Object.is,
  ) => {
    const initialValue = selector(api.getState())
    const state = reactive(initialValue as Record<any, any>)

    const listener = () => {
      const nextState = api.getState()
      const nextStateSlice = selector(nextState)

      try {
        if (!equalityFn(state, nextStateSlice))
          updateState(state, nextStateSlice)
      }
      catch (e) {}
    }

    const unsubscribe = api.subscribe(listener)

    if (getCurrentInstance()) {
      onUnmounted(() => {
        unsubscribe()
      })
    }

    return toRefs(readonly(state))
  }

  Object.assign(useStore, api)

  return useStore
}
