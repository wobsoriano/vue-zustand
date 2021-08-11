
import { onBeforeMount, shallowRef } from 'vue-demi';
import createImpl, {
  StateCreator,
  SetState,
  State,
  StoreApi,
  GetState,
  Subscribe,
  Destroy,
  StateSelector,
  EqualityChecker,
} from 'zustand/vanilla';

export interface UseStore<T extends State> {
  (): T;
  <U>(selector: StateSelector<T, U>, equalityFn?: EqualityChecker<U>): U;
  setState: SetState<T>;
  getState: GetState<T>;
  subscribe: Subscribe<T>;
  destroy: Destroy;
}

export {
  default as shallow
} from 'zustand/shallow';

export default function create<TState extends State>(
  createState: StateCreator<TState> | StoreApi<TState>
): UseStore<TState> {
  const api: StoreApi<TState> =
    typeof createState === 'function' ? createImpl(createState) : createState;

  const useStore: any = <StateSlice>(
    selector: StateSelector<TState, StateSlice> = api.getState as any,
    equalityFn: EqualityChecker<StateSlice> = Object.is
  ) => {
    const initialValue = selector(api.getState())
    const state = shallowRef(initialValue);
    const unsubscribe = api.subscribe((newState) => {
      state.value = newState;
    }, selector, equalityFn);
    onBeforeMount(() => unsubscribe());
    return state;
  }

  Object.assign(useStore, api);

  return useStore;
}