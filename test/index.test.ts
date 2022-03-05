import { expect, test } from 'vitest'
import create from '../src'

interface BearState {
  bears: number
  increase: () => void
  decrease: () => void
}

const useStore = create<BearState>(set => ({
  bears: 0,
  increase: () => set(state => ({ bears: state.bears + 1 })),
  decrease: () => set(state => ({ bears: state.bears - 1 })),
}))

test('returns default zustand properties', () => {
  expect(typeof useStore.setState).toBe('function')
  expect(typeof useStore.getState).toBe('function')
  expect(typeof useStore.subscribe).toBe('function')
  expect(typeof useStore.destroy).toBe('function')
})

test('increments', () => {
  const bears = useStore(state => state.bears)
  const increase = useStore(state => state.increase)
  expect(bears.value).toBe(0)
  increase.value()
  increase.value()
  expect(bears.value).toBe(2)
})

test('decrements', () => {
  const bears = useStore(state => state.bears)
  const decrease = useStore(state => state.decrease)
  decrease.value()
  expect(bears.value).toBe(1)
  decrease.value()
  expect(bears.value).toBe(0)
})
