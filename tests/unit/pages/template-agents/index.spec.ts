import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

import TemplateAgentsPage from '~/pages/template-agents/index.vue'

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
const ElButton = { name: 'ElButton', template: '<button class="el-button"><slot /></button>' }
const ElTable = { name: 'ElTable', template: '<table class="el-table"><slot /></table>' }
const ElTableColumn = { name: 'ElTableColumn', template: '<td class="el-table-column"><slot /></td>' }
const ElTag = { name: 'ElTag', template: '<span class="el-tag"><slot /></span>' }

describe('TemplateAgentsPage', () => {
  it('should render page title correctly', () => {
    const wrapper = mount(TemplateAgentsPage, {
      global: {
        stubs: {
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
          ElButton,
          ElTable,
          ElTableColumn,
          ElTag,
        },
      },
    })

    expect(wrapper.find('.template-agents__title').text()).toBe('テンプレートエージェント')
  })

  it('should render subtitle correctly', () => {
    const wrapper = mount(TemplateAgentsPage, {
      global: {
        stubs: {
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
          ElButton,
          ElTable,
          ElTableColumn,
          ElTag,
        },
      },
    })

    expect(wrapper.find('.template-agents__subtitle').text()).toContain('事前定義された巡回パターン')
  })
})
