import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { defineComponent, ref } from 'vue'

import TemplateAgentsPage from '~/pages/template-agents/index.vue'
import type { TemplateAgentExecutionMode, TemplateAgentFormData } from '~/pages/template-agents/types'
import type { TemplateAgentExecuteResponse } from '~/types/api'

// Element Plus stubs
const ElCard = { name: 'ElCard', template: '<div class="el-card"><slot name="header" /><slot /></div>' }
const ElAlert = { name: 'ElAlert', template: '<div class="el-alert"><slot /></div>' }
const ElRadioGroup = { name: 'ElRadioGroup', template: '<div class="el-radio-group"><slot /></div>' }
const ElRadioButton = { name: 'ElRadioButton', template: '<div class="el-radio-button"><slot /></div>' }
const ElForm = { name: 'ElForm', template: '<div class="el-form"><slot /></div>' }
const ElFormItem = { name: 'ElFormItem', template: '<div class="el-form-item"><slot /></div>' }
const ElSelect = { name: 'ElSelect', template: '<div class="el-select"><slot /></div>' }
const ElOption = { name: 'ElOption', template: '<div class="el-option"><slot /></div>' }
const ElCheckboxGroup = { name: 'ElCheckboxGroup', template: '<div class="el-checkbox-group"><slot /></div>' }
const ElCheckbox = { name: 'ElCheckbox', template: '<div class="el-checkbox"><slot /></div>' }
const ElInputNumber = { name: 'ElInputNumber', template: '<input class="el-input-number" />' }
const ElSwitch = { name: 'ElSwitch', template: '<input class="el-switch" type="checkbox" />' }
const ElButton = { name: 'ElButton', template: '<button class="el-button"><slot /></button>' }
const ElTable = { name: 'ElTable', template: '<table class="el-table"><slot /></table>' }
const ElTableColumn = { name: 'ElTableColumn', template: '<td class="el-table-column"></td>' }
const ElTag = { name: 'ElTag', template: '<span class="el-tag"><slot /></span>' }
const ElEmpty = { name: 'ElEmpty', template: '<div class="el-empty"><slot /></div>' }
const ElProgress = { name: 'ElProgress', template: '<div class="el-progress"><slot /></div>' }

const EnvironmentVisualizationStub = defineComponent({
  name: 'EnvironmentVisualization',
  props: {
    gridWidth: { type: Number, required: false },
    gridHeight: { type: Number, required: false },
    threatGrid: { type: Array, required: false },
    coverageMap: { type: Array, required: false },
    robotPosition: { type: Object, required: false },
    robotOrientation: { type: Number, required: false },
    trajectory: { type: Array, required: false },
    chargingStationPosition: { type: Object, required: false },
  },
  template: '<div class="environment-visualization-stub" />',
})

const baseStubs = {
  ElCard,
  ElAlert,
  ElRadioGroup,
  ElRadioButton,
  ElForm,
  ElFormItem,
  ElSelect,
  ElOption,
  ElCheckboxGroup,
  ElCheckbox,
  ElInputNumber,
  ElSwitch,
  ElButton,
  ElTable,
  ElTableColumn,
  ElTag,
  ElEmpty,
  ElProgress,
  EnvironmentVisualization: EnvironmentVisualizationStub,
}

const useTemplateAgentsMock = vi.fn()

vi.mock('~/composables/useTemplateAgents', () => ({
  useTemplateAgents: () => useTemplateAgentsMock(),
}))

const createState = (
  overrides?: Partial<{
    executionMode: TemplateAgentExecutionMode
    formData: TemplateAgentFormData
    executeResult: TemplateAgentExecuteResponse | null
  }>
) => ({
  agentTypes: ref([]),
  executeResult: ref(overrides?.executeResult ?? null),
  compareResult: ref(null),
  isLoading: ref(false),
  error: ref(null),
  fetchAgentTypes: vi.fn(),
  executeAgent: vi.fn(),
  compareAgents: vi.fn(),
  clearError: vi.fn(),
  clearResults: vi.fn(),
  executionMode: ref(overrides?.executionMode ?? 'single'),
  formData: ref(
    overrides?.formData ?? {
      agentType: 'horizontal_scan',
      compareAgentTypes: [],
      width: 10,
      height: 10,
      episodes: 10,
      maxSteps: 1000,
      seed: null,
      useDynamicMaxSteps: true,
    }
  ),
})

const mountPage = () => {
  return mount(TemplateAgentsPage, {
    global: {
      stubs: baseStubs,
    },
  })
}

beforeEach(() => {
  useTemplateAgentsMock.mockReturnValue(createState())
})

describe('TemplateAgentsPage', () => {
  it('should render page title correctly', () => {
    const wrapper = mountPage()
    expect(wrapper.find('.template-agents__title').text()).toBe('テンプレートエージェント')
  })

  it('should render subtitle correctly', () => {
    const wrapper = mountPage()
    expect(wrapper.find('.template-agents__subtitle').text()).toContain('事前定義された巡回パターン')
  })

  it('shows dynamic max steps hint by default', () => {
    const wrapper = mountPage()
    expect(wrapper.find('.template-agents__form-hint').text()).toContain('環境サイズに応じて自動計算')
  })

  it('requires at least two agents for comparison', async () => {
    const wrapper = mountPage()
    ;(wrapper.vm as any).executionMode = 'compare'
    await wrapper.vm.$nextTick()
    const hints = wrapper.findAll('.template-agents__form-hint')
    const compareHint = hints.find((hint) => hint.text().includes('比較モード'))
    expect(compareHint?.text()).toContain('2つ以上のエージェント')
  })

  it('renders environment visualization summary when execution result has environment info', () => {
    const executeResult = ref({
      agent_type: 'horizontal_scan',
      agent_name: 'HorizontalScanAgent',
      execution_id: 'templ-test',
      environment: { width: 4, height: 4 },
      episodes: 1,
      average_reward: 120,
      std_reward: 5,
      average_coverage: 0.8,
      average_episode_length: 120,
      average_patrol_count: 40,
      average_min_battery: 75,
      total_battery_deaths: 0,
      episode_metrics: [
        {
          episode: 1,
          total_reward: 120,
          episode_length: 120,
          coverage_ratio: 0.8,
          patrol_count: 12,
          move_count: 60,
          turn_count: 30,
          min_battery: 70,
          battery_deaths: 0,
          charging_events: 2,
        },
      ],
      environment_info: {
        width: 4,
        height: 4,
        obstacles: [
          [false, false, false, false],
          [false, true, false, false],
          [false, false, false, false],
          [false, false, true, false],
        ],
        threat_grid: [
          [0, 0.1, 0.3, 0.2],
          [0.2, 0.4, 0.1, 0],
          [0.3, 0.5, 0.2, 0.1],
          [0.1, 0, 0.2, 0.4],
        ],
        charging_station: { x: 0, y: 0 },
        suspicious_objects: [{ x: 2, y: 1, type: 'package', threat_level: 0.6 }],
      },
      episode_playbacks: [
        {
          episode: 1,
          total_reward: 120,
          final_coverage: 0.8,
          episode_length: 2,
          frames: [
            {
              timestep: 0,
              robot_x: 0,
              robot_y: 0,
              robot_orientation: 0,
              action: 0,
              reward: 0.5,
              battery_percentage: 100,
              is_charging: false,
              coverage_map: [
                [1, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
              ],
              threat_grid: [
                [0, 0.1, 0.2, 0.3],
                [0.3, 0.2, 0.1, 0],
                [0.4, 0.5, 0.6, 0.7],
                [0.8, 0.9, 1, 0.4],
              ],
              timestamp: '2025-01-01T00:00:00Z',
            },
            {
              timestep: 1,
              robot_x: 1,
              robot_y: 0,
              robot_orientation: 1,
              action: 0,
              reward: 0.5,
              battery_percentage: 99,
              is_charging: false,
              coverage_map: [
                [1, 1, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
              ],
              threat_grid: [
                [0.4, 0.2, 0.1, 0],
                [0.5, 0.3, 0.2, 0.1],
                [0.6, 0.4, 0.3, 0.2],
                [0.7, 0.5, 0.4, 0.3],
              ],
              timestamp: '2025-01-01T00:00:01Z',
            },
          ],
        },
      ],
    })

    useTemplateAgentsMock.mockReturnValue(createState({ executeResult: executeResult.value }))

    const wrapper = mountPage()
    expect(wrapper.findComponent(EnvironmentVisualizationStub).exists()).toBe(true)
    expect(wrapper.find('.template-agents__route-list').text()).toContain('(1, 0)')
    expect(wrapper.text()).toContain('現在位置')

    const viz = wrapper.findComponent(EnvironmentVisualizationStub)
    expect(viz.props('threatGrid')).toEqual([
      [0.4, 0.2, 0.1, 0],
      [0.5, 0.3, 0.2, 0.1],
      [0.6, 0.4, 0.3, 0.2],
      [0.7, 0.5, 0.4, 0.3],
    ])
  })
})
