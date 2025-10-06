import type { Ref, ToRefs } from 'vue'

type Primitive = null | undefined | string | number | boolean | symbol | bigint

export function isPrimitive(val: unknown): val is Primitive {
  if (typeof val === 'object')
    return val === null

  return typeof val !== 'function'
}

export type IsPrimitive<T> = T extends Primitive ? Ref<T> : ToRefs<T>
