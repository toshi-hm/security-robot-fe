import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

import SessionStatusTag from '~/components/common/SessionStatusTag.vue'

describe('SessionStatusTag', () => {
  const createWrapper = (status: string) => {
    return mount(SessionStatusTag, {
      props: { status },
      global: {
        stubs: {
          ElTag: {
            template: '<span class="el-tag" :class="`el-tag--${type}`"><slot /></span>',
            props: ['type', 'size'],
          },
        },
      },
    })
  }

  it('renders running status correctly', () => {
    const wrapper = createWrapper('running')

    expect(wrapper.text()).toContain('実行中')
    expect(wrapper.find('.el-tag--success').exists()).toBe(true)
  })

  it('renders paused status correctly', () => {
    const wrapper = createWrapper('paused')

    expect(wrapper.text()).toContain('一時停止')
    expect(wrapper.find('.el-tag--warning').exists()).toBe(true)
  })

  it('renders completed status correctly', () => {
    const wrapper = createWrapper('completed')

    expect(wrapper.text()).toContain('完了')
    expect(wrapper.find('.el-tag--info').exists()).toBe(true)
  })

  it('renders failed status correctly', () => {
    const wrapper = createWrapper('failed')

    expect(wrapper.text()).toContain('失敗')
    expect(wrapper.find('.el-tag--danger').exists()).toBe(true)
  })

  it('renders created status correctly', () => {
    const wrapper = createWrapper('created')

    expect(wrapper.text()).toContain('作成済み')
    expect(wrapper.find('.el-tag--info').exists()).toBe(true)
  })
})
