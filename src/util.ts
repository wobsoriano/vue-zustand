import type { Ref, ToRefs } from 'vue'

export function isPrimitive<T>(val: T): boolean {
  if (typeof val === 'object')
    return val === null

  return typeof val !== 'function'
}

type Primitive = null | undefined | string | number | boolean | symbol | bigint

export type IsPrimitive<T> = T extends Primitive ? Ref<T> : ToRefs<T>
