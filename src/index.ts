import type { Ref } from 'vue'
import { getCurrentInstance, onUnmounted, ref } from 'vue'
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

type UseBoundStore<
  T extends State,
  CustomStoreApi extends StoreApi<T> = StoreApi<T>,
> = {
  (): Ref<T>
  <U>(selector: StateSelector<T, U>, equalityFn?: EqualityChecker<U>): Ref<U>
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
    const state = ref(initialValue)

    const listener = () => {
      const nextState = api.getState()
      const nextStateSlice = selector(nextState)

      try {
        if (!equalityFn(state.value as StateSlice, nextStateSlice)) {
          // @ts-expect-error: Incompatible types
          state.value = nextStateSlice
        }
      }
      catch (e) {
        // @ts-expect-error: Incompatible types
        state.value = nextStateSlice
      }
    }

    const unsubscribe = api.subscribe(listener)

    if (getCurrentInstance()) {
      onUnmounted(() => {
        unsubscribe()
      })
    }

    return state
  }

  Object.assign(useStore, api)

  return useStore
}
