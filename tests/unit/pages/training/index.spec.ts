import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { nextTick, ref } from 'vue'

import TrainingIndexPage from '~/pages/training/index.vue'

describe('Training Index Page', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })
  const mountPage = ({ sessionsData = [], mountOptions = {} } = {}) => {
    const sessionsRef = ref(sessionsData)
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

  it('filters sessions when search query is provided', async () => {
    const sessionsData = [
      {
        id: 1,
        name: 'Alpha Session',
        algorithmDisplayName: 'PPO',
        status: 'running',
        isRunning: true,
        progress: 20,
        currentTimestep: 200,
        totalTimesteps: 1000,
        episodesCompleted: 10,
      },
      {
        id: 2,
        name: 'Beta Session',
        algorithmDisplayName: 'A3C',
        status: 'completed',
        isRunning: false,
        progress: 100,
        currentTimestep: 1000,
        totalTimesteps: 1000,
        episodesCompleted: 50,
      },
    ]

    const { wrapper } = mountPage({ sessionsData })

    // Directly set searchQuery instead of calling handleSearch
    wrapper.vm.searchQuery = 'beta'
    await nextTick()

    expect(wrapper.vm.filteredSessions).toHaveLength(1)
    expect(wrapper.vm.filteredSessions[0].id).toBe(2)
  })
})
