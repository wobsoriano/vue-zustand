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
import createZustandStore from 'zustand/vanilla'

type UseBoundStore<
  T extends State,
  CustomStoreApi extends StoreApi<T> = StoreApi<T>,
> = {
  (): Ref<T>
  <U>(selector: StateSelector<T, U>, equalityFn?: EqualityChecker<U>): Ref<U>
} & CustomStoreApi

function create<
  TState extends State,
  CustomSetState,
  CustomGetState,
  CustomStoreApi extends StoreApi<TState>,
>(
  createState:
  | StateCreator<TState, CustomSetState, CustomGetState, CustomStoreApi>
  | CustomStoreApi
): UseBoundStore<TState, CustomStoreApi>

function create<TState extends State>(
  createState:
  | StateCreator<TState, SetState<TState>, GetState<TState>, any>
  | StoreApi<TState>
): UseBoundStore<TState, StoreApi<TState>>

function create<
  TState extends State,
  CustomSetState,
  CustomGetState,
  CustomStoreApi extends StoreApi<TState>,
>(
  createState:
  | StateCreator<TState, CustomSetState, CustomGetState, CustomStoreApi>
  | CustomStoreApi,
): UseBoundStore<TState, CustomStoreApi> {
  const api: CustomStoreApi
    = typeof createState === 'function' ? createZustandStore(createState) : createState

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
      catch (e) {}
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

export default create
