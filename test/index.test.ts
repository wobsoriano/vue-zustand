import { mount } from '@vue/test-utils'
import shallow from 'zustand/shallow'
import { beforeEach, describe, expect, it } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import create from '../src'

interface CountState { count: number; increase: () => void; decrease: () => void }

const useCounterStore = create<CountState>(set => ({
  count: 0,
  increase: () => set(state => ({ count: state.count + 1 })),
  decrease: () => set(state => ({ count: state.count - 1 })),
}))

describe('create', () => {
  beforeEach(() => {
    useCounterStore.setState({ count: 0 })
  })

  it('returns default zustand properties', () => {
    const useStore = create(() => ({}))

    expect(typeof useStore.setState).toBe('function')
    expect(typeof useStore.getState).toBe('function')
    expect(typeof useStore.subscribe).toBe('function')
    expect(typeof useStore.destroy).toBe('function')
  })

  it('functions correct when rendering in vue', async() => {
    const App = defineComponent({
      setup() {
        const { count, increase, decrease } = useCounterStore()

        return { count, increase, decrease }
      },
      template: `
        <div>
          <div data-test="count">{{ count }}</div>
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
    expect(wrapper.get('[data-test="count"]').text()).toBe('2')
    dec.trigger('click')
    await nextTick()
    expect(wrapper.get('[data-test="count"]').text()).toBe('1')
  })

  it('allows multiple state slices by object', async() => {
    const App = defineComponent({
      setup() {
        const { count, increase } = useCounterStore(
          state => ({ count: state.count, increase: state.increase }),
          shallow,
        )

        return {
          count,
          increase,
        }
      },
      template: `
        <div>
          <div data-test="count">{{ count }}</div>
          <button data-test="inc" @click="increase">+</button>
        </div>
      `,
    })

    const wrapper = mount(App)
    expect(wrapper.get('[data-test="count"]').text()).toBe('0')
    wrapper.get('[data-test="inc"]').trigger('click')
    await nextTick()
    expect(wrapper.get('[data-test="count"]').text()).toBe('1')
  })

  // it('allows multiple state slices by array', async() => {
  //   const App = defineComponent({
  //     setup() {
  //       const [count, increase] = useCounterStore(
  //         state => [state.count, state.increase],
  //         shallow,
  //       )

  //       console.log(count)

  //       return {
  //         count,
  //         increase,
  //       }
  //     },
  //     template: `
  //       <div>
  //         <div data-test="count">{{ count }}</div>
  //         <button data-test="inc" @click="increase">+</button>
  //       </div>
  //     `,
  //   })

  //   const wrapper = mount(App)
  //   expect(wrapper.get('[data-test="count"]').text()).toBe('0')
  //   wrapper.get('[data-test="inc"]').trigger('click')
  //   await nextTick()
  //   expect(wrapper.get('[data-test="count"]').text()).toBe('1')
  // })
})
