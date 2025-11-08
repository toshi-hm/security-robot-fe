import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

import SearchFilter from '~/components/common/SearchFilter.vue'

describe('SearchFilter', () => {
  const createWrapper = (props: any = {}) => {
    return mount(SearchFilter, {
      props: {
        modelValue: '',
        placeholder: 'Search...',
        ...props,
      },
      global: {
        stubs: {
          ElInput: {
            template: `
              <div class="el-input">
                <input
                  :value="modelValue"
                  :placeholder="placeholder"
                  @input="$emit('update:modelValue', $event.target.value)"
                  @keyup.enter="$emit('search', modelValue)"
                  class="el-input__inner"
                />
                <slot name="prefix" />
              </div>
            `,
            props: ['modelValue', 'placeholder', 'clearable'],
            emits: ['update:modelValue', 'search', 'clear'],
          },
          ElIcon: {
            template: '<span class="el-icon"><slot /></span>',
          },
        },
      },
    })
  }

  it('renders with default props', () => {
    const wrapper = createWrapper()

    expect(wrapper.find('.el-input').exists()).toBe(true)
    expect(wrapper.find('input').attributes('placeholder')).toBe('Search...')
  })

  it('binds v-model correctly', async () => {
    const wrapper = createWrapper({ modelValue: 'test query' })

    const input = wrapper.find('input')
    expect(input.element.value).toBe('test query')
  })

  it('emits update:modelValue when input changes', async () => {
    const wrapper = createWrapper()

    const input = wrapper.find('input')
    await input.setValue('new value')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['new value'])
  })

  it('emits search event on Enter key', async () => {
    const wrapper = createWrapper({ modelValue: 'search term' })

    const input = wrapper.find('input')
    await input.trigger('keyup.enter')

    expect(wrapper.emitted('search')).toBeTruthy()
  })

  it('renders prefix icon slot', () => {
    const wrapper = createWrapper()

    expect(wrapper.find('.el-icon').exists()).toBe(true)
  })
})
