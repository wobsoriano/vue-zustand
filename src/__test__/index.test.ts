import { mount } from '@vue/test-utils'
import shallow from 'zustand/shallow'
import { describe, expect, it } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import create from '../index'

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
        return {
          ...useStore(),
        }
      },
      template: `
        <div>
          <div data-test="bears">{{ bears }}</div>
          <button data-test="inc" @click="increase">+</button>
          <button data-test="dec" @click="decrease">-</button>
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
      increase: () =>
        set(state => ({ bears: state.bears + 1, bulls: state.bulls + 1 })),
    }))

    const App = defineComponent({
      setup() {
        const {
          bears,
          increase,
        } = useStore(
          state => ({ bears: state.bears, increase: state.increase }),
          shallow,
        )
        return { bears, increase }
      },
      template: `
        <div>
          <div data-test="bears">{{ bears }}</div>
          <button data-test="inc" @click="increase">+</button>
        </div>
      `,
    })

    const wrapper = mount(App)
    expect(wrapper.get('[data-test="bears"]').text()).toBe('0')
    wrapper.get('[data-test="inc"]').trigger('click')
    await nextTick()
    expect(wrapper.get('[data-test="bears"]').text()).toBe('1')
  })
})
