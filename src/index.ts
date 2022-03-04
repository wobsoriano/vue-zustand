import { onUnmounted, ref, getCurrentInstance, Ref } from 'vue'
import createImpl, {
  StateCreator,
  SetState,
  State,
  StoreApi,
  GetState,
  StateSelector,
  EqualityChecker,
} from 'zustand/vanilla'

export type UseBoundStore<
  T extends State,
  CustomStoreApi extends StoreApi<T> = StoreApi<T>
> = {
  (): Ref<T>
  <U>(selector: StateSelector<T, U>, equalityFn?: EqualityChecker<U>): Ref<U>
} & CustomStoreApi

export default function create<
  TState extends State,
  CustomSetState = SetState<TState>,
  CustomGetState = GetState<TState>,
  CustomStoreApi extends StoreApi<TState> = StoreApi<TState>
>(
  createState:
    | StateCreator<TState, CustomSetState, CustomGetState, CustomStoreApi>
    | CustomStoreApi
): UseBoundStore<TState, CustomStoreApi> {
  const api: StoreApi<TState> =
    typeof createState === 'function' ? createImpl(createState) : createState

  const useStore: any = <StateSlice>(
    selector: StateSelector<TState, StateSlice> = api.getState as any,
    equalityFn: EqualityChecker<StateSlice> = Object.is
  ) => {
    const initialValue = selector(api.getState())
    const state = ref(initialValue)

    const listener = () => {
      const nextState = api.getState()
      const nextStateSlice = selector(nextState)

      try {
        if (!equalityFn(state.value as StateSlice, nextStateSlice)) {
          // @ts-ignore
          state.value = nextStateSlice
        }
      } catch (e) {
        // @ts-ignore
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
