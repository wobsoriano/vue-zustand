import { mount } from '@vue/test-utils'
import shallow from 'zustand/shallow'
import { describe, expect, it } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import create from '../src'

describe('create', () => {
  it('returns default zustand properties', () => {
    const useStore = create(() => ({}))

    expect(typeof useStore.setState).toBe('function')
    expect(typeof useStore.getState).toBe('function')
    expect(typeof useStore.subscribe).toBe('function')
    expect(typeof useStore.destroy).toBe('function')
  })

  it('functions correct when rendering in vue', async() => {
    const useStore = create<{ bears: number }>(set => ({
      bears: 0,
      increase: () => set(state => ({ bears: state.bears + 1 })),
      decrease: () => set(state => ({ bears: state.bears - 1 })),
    }))

    const App = defineComponent({
      setup() {
        return { state: useStore() }
      },
      template: `
        <div>
          <div data-test="bears">{{ state.bears }}</div>
          <button data-test="inc" @click="state.increase">+</button>
          <button data-test="dec" @click="state.decrease">-</button>
        </div>
      `,
    })

    const wrapper = mount(App)
    const inc = wrapper.get('[data-test="inc"]')
    const dec = wrapper.get('[data-test="dec"]')
    inc.trigger('click')
    inc.trigger('click')
    await nextTick()
    expect(wrapper.get('[data-test="bears"]').text()).toBe('2')
    dec.trigger('click')
    await nextTick()
    expect(wrapper.get('[data-test="bears"]').text()).toBe('1')
  })

  it('allows multiple state slices', async() => {
    interface BearState {
      bears: number
      bulls: number
      increase: () => void
    }

    const useStore = create<BearState>(set => ({
      bears: 0,
      bulls: 0,
      increase: () => set(state => ({ bears: state.bears + 1, bulls: state.bulls + 1 })),
    }))

    const App = defineComponent({
      setup() {
        const state = useStore(
          state => ({ bears: state.bears, increase: state.increase }),
          shallow,
        )

        return { state }
      },
      template: `
        <div>
          <div data-test="bears">{{ state.bears }}</div>
          <div data-test="bulls">{{ state.bulls }}</div>
          <button data-test="inc" @click="state.increase">+</button>
        </div>
      `,
    })

    const wrapper = mount(App)
    expect(wrapper.get('[data-test="bears"]').text()).toBe('0')
    expect(wrapper.get('[data-test="bulls"]').text()).toBe('')
    wrapper.get('[data-test="inc"]').trigger('click')
    await nextTick()
    expect(wrapper.get('[data-test="bears"]').text()).toBe('1')
  })
})
