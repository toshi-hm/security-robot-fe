import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import { ref } from 'vue'

import TrainingIndexPage from '~/pages/training/index.vue'

describe('Training Index Page', () => {
  const mountPage = (options = {}) => {
    return mount(TrainingIndexPage, {
      shallow: true,
      global: {
        stubs: {
          TrainingControl: {
            name: 'TrainingControl',
            template: '<div class="training-control"></div>',
          },
          'el-card': true,
          'el-button': true,
          'el-table': true,
          'el-table-column': true,
          'el-tag': true,
          'el-progress': true,
          'el-empty': true,
        },
        directives: {
          loading: () => {},
        },
        mocks: {
          useTraining: () => ({
            sessions: ref([]),
            fetchSessions: vi.fn(),
            isLoading: ref(false),
            currentSession: ref(null),
          }),
          useRouter: () => ({
            push: vi.fn(),
          }),
        },
      },
      ...options,
    })
  }

  it('renders the page', () => {
    const wrapper = mountPage()
    expect(wrapper.find('.training-page').exists()).toBe(true)
  })

  it('displays the page title', () => {
    const wrapper = mountPage()
    expect(wrapper.find('h2').text()).toBe('学習セッション')
  })

  it('has training-page__control section', () => {
    const wrapper = mountPage()
    expect(wrapper.find('.training-page__control').exists()).toBe(true)
  })

  it('has training-page__sessions section', () => {
    const wrapper = mountPage()
    expect(wrapper.find('.training-page__sessions').exists()).toBe(true)
  })
})
