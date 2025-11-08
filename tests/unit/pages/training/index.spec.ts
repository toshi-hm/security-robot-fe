import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { ref } from 'vue'

import type { TrainingSession } from '~/libs/domains/training/TrainingSession'
import TrainingIndexPage from '~/pages/training/index.vue'

describe('Training Index Page', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })
  const mountPage = ({ sessionsData = [], mountOptions = {} } = {}) => {
    const sessionsRef = ref<TrainingSession[]>(sessionsData)
    const trainingMock = {
      sessions: sessionsRef,
      fetchSessions: vi.fn(),
      isLoading: ref(false),
      currentSession: ref(null),
    }
    const routerMock = {
      push: vi.fn(),
    }

    vi.stubGlobal('useTraining', () => trainingMock)
    vi.stubGlobal('useRouter', () => routerMock)

    const wrapper = mount(TrainingIndexPage, {
      shallow: true,
      global: {
        stubs: {
          TrainingControl: {
            name: 'TrainingControl',
            template: '<div class="training-control"></div>',
          },
          SearchFilter: {
            name: 'SearchFilter',
            template: '<div class="search-filter"></div>',
            props: ['modelValue'],
          },
          SessionStatusTag: {
            name: 'SessionStatusTag',
            template: '<span class="session-status-tag"></span>',
            props: ['status'],
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
      },
      ...mountOptions,
    })

    return { wrapper, trainingMock, routerMock, sessionsRef }
  }

  it('renders the page', () => {
    const { wrapper } = mountPage()
    expect(wrapper.find('.training-page').exists()).toBe(true)
  })

  it('displays the page title', () => {
    const { wrapper } = mountPage()
    expect(wrapper.find('h2').text()).toBe('学習セッション')
  })

  it('has training-page__control section', () => {
    const { wrapper } = mountPage()
    expect(wrapper.find('.training-page__control').exists()).toBe(true)
  })

  it('has training-page__sessions section', () => {
    const { wrapper } = mountPage()
    expect(wrapper.find('.training-page__sessions').exists()).toBe(true)
  })

  it('renders search filter component', () => {
    const { wrapper } = mountPage()
    expect(wrapper.findComponent({ name: 'SearchFilter' }).exists()).toBe(true)
  })
})
