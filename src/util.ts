import type { Ref, ToRefs } from 'vue'
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

export function isPrimitive<T>(val: T): boolean {
  if (typeof val === 'object')
    return val === null

  return typeof val !== 'function'
}

type Primitive = null | undefined | string | number | boolean | symbol | bigint

export type IsPrimitive<T> = T extends Primitive ? Ref<T> : ToRefs<T>
