import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'
import { defineComponent, nextTick } from 'vue'
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

const App = defineComponent({
  setup() {
    const bears = useStore(state => state.bears)
    const increase = useStore(state => state.increase)
    const decrease = useStore(state => state.decrease)

    return {
      bears,
      increase,
      decrease,
    }
  },
  template: `
    <div>
      <div data-test="count">{{ bears }}</div>
      <button data-test="inc" @click="increase">Increase</button>
      <button data-test="dec" @click="decrease">Increase</button>
    </div>
  `,
})

test('returns default zustand properties', () => {
  expect(typeof useStore.setState).toBe('function')
  expect(typeof useStore.getState).toBe('function')
  expect(typeof useStore.subscribe).toBe('function')
  expect(typeof useStore.destroy).toBe('function')
})

test('increments', async() => {
  const wrapper = mount(App)
  const inc = wrapper.get('[data-test="inc"]')
  inc.trigger('click')
  await nextTick()
  expect(wrapper.get('[data-test="count"]').text()).toBe('1')
  inc.trigger('click')
  await nextTick()
  expect(wrapper.get('[data-test="count"]').text()).toBe('2')
})

test('decrements', async() => {
  const wrapper = mount(App)
  const dec = wrapper.get('[data-test="dec"]')
  dec.trigger('click')
  await nextTick()
  expect(wrapper.get('[data-test="count"]').text()).toBe('1')
  dec.trigger('click')
  await nextTick()
  expect(wrapper.get('[data-test="count"]').text()).toBe('0')
})
