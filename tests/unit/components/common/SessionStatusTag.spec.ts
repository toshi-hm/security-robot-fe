import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

import SessionStatusTag from '~/components/common/SessionStatusTag.vue'
import { SESSION_STATUS_MAP } from '~/configs/constants'

describe('SessionStatusTag', () => {
  const createWrapper = (status: string) => {
    return mount(SessionStatusTag, {
      props: { status },
      global: {
        stubs: {
          ElTag: {
            template: '<span class="el-tag" :class="\'el-tag--\' + type"><slot /></span>',
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

  it('renders queued status correctly', () => {
    const wrapper = createWrapper('queued')

    expect(wrapper.text()).toContain('キュー中')
    expect(wrapper.find('.el-tag--primary').exists()).toBe(true)
  })

  it('renders unknown status with default fallback', () => {
    const wrapper = createWrapper('unknown')

    expect(wrapper.text()).toContain('unknown')
    expect(wrapper.find('.el-tag--info').exists()).toBe(true)
  })

  it('uses SESSION_STATUS_MAP from configs/constants', () => {
    // Verify that all statuses in SESSION_STATUS_MAP are properly handled
    Object.keys(SESSION_STATUS_MAP).forEach((status) => {
      const wrapper = createWrapper(status)
      const config = SESSION_STATUS_MAP[status as keyof typeof SESSION_STATUS_MAP]
      if (!config) throw new Error(`Config for status ${status} not found`)

      expect(wrapper.text()).toContain(config.text)
    })
  })
})
