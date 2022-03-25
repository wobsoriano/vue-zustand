import type { Ref } from 'vue'
import { computed, reactive, unref } from 'vue'

export function refToReactive<O, K extends keyof O>(
  result: Ref<O>,
): O {
  const keys = Object.keys(unref(result))
  return reactive(
    Object.fromEntries(
      keys.map(key => [key, computed(() => result.value[key as K])]),
    ),
  ) as O
}
