<script setup lang="ts">
import {
  TEMPLATE_AGENT_GRID_MAX,
  TEMPLATE_AGENT_GRID_MIN,
  TEMPLATE_AGENT_SEED_MAX,
  TEMPLATE_AGENT_SEED_MIN,
} from '~/configs/constants'
import type { TemplateAgentType } from '~/types/api'
import type { TemplateAgentExecutionMode, TemplateAgentFormData } from '../types'

const props = defineProps<{
  executionMode: TemplateAgentExecutionMode
  formData: TemplateAgentFormData
  agentTypes: Array<{
    type: TemplateAgentType
    name: string
    description?: string
  }>
  compareSelectionValid: boolean
  canExecute: boolean
  maxStepsHint: string
  isLoading: boolean
}>()

const emit = defineEmits<{
  (event: 'update:executionMode', value: TemplateAgentExecutionMode): void
  (event: 'update:formData', value: TemplateAgentFormData): void
  (event: 'execute'): void
  (event: 'reset'): void
}>()

const updateExecutionMode = (mode: TemplateAgentExecutionMode) => {
  emit('update:executionMode', mode)
}

const updateFormField = <K extends keyof TemplateAgentFormData>(key: K, value: TemplateAgentFormData[K]) => {
  emit('update:formData', { ...props.formData, [key]: value })
}

const handleExecute = () => emit('execute')
const handleReset = () => emit('reset')
</script>

<template>
  <div class="template-agents__form-wrapper">
    <el-card class="template-agents__mode-card">
      <template #header>
        <span>実行モード</span>
      </template>
      <el-radio-group
        :model-value="executionMode"
        class="template-agents__mode-group"
        @update:model-value="updateExecutionMode"
      >
        <el-radio-button value="single">単一実行</el-radio-button>
        <el-radio-button value="compare">比較実行</el-radio-button>
      </el-radio-group>
    </el-card>

    <el-card class="template-agents__config-card">
      <template #header>
        <span>実行設定</span>
      </template>

      <el-form label-width="180px" label-position="left" class="template-agents__form">
        <el-form-item v-if="executionMode === 'single'" label="エージェントタイプ">
          <el-select
            :model-value="formData.agentType"
            placeholder="エージェントを選択"
            @update:model-value="(value: TemplateAgentType) => updateFormField('agentType', value)"
          >
            <el-option v-for="type in agentTypes" :key="type.type" :label="type.name" :value="type.type">
              <span>{{ type.name }}</span>
              <span class="template-agents__option-subtitle">
                {{ type.description }}
              </span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item v-else label="比較対象エージェント">
          <el-checkbox-group
            :model-value="formData.compareAgentTypes"
            @update:model-value="(value: TemplateAgentType[]) => updateFormField('compareAgentTypes', value)"
          >
            <el-checkbox v-for="type in agentTypes" :key="type.type" :value="type.type" :label="type.type">
              <span>{{ type.name }}</span>
              <span class="template-agents__option-subtitle">
                ({{ type.description }})
              </span>
            </el-checkbox>
          </el-checkbox-group>
          <p v-if="!compareSelectionValid" class="template-agents__form-hint">
            比較モードでは2つ以上のエージェントを選択してください
          </p>
        </el-form-item>

        <el-form-item label="グリッド幅">
          <el-input-number
            :model-value="formData.width"
            :min="TEMPLATE_AGENT_GRID_MIN"
            :max="TEMPLATE_AGENT_GRID_MAX"
            :step="1"
            @update:model-value="(value: number) => updateFormField('width', value)"
          />
        </el-form-item>

        <el-form-item label="グリッド高さ">
          <el-input-number
            :model-value="formData.height"
            :min="TEMPLATE_AGENT_GRID_MIN"
            :max="TEMPLATE_AGENT_GRID_MAX"
            :step="1"
            @update:model-value="(value: number) => updateFormField('height', value)"
          />
        </el-form-item>

        <el-form-item label="エピソード数">
          <el-input-number
            :model-value="formData.episodes"
            :min="1"
            :max="100"
            :step="1"
            @update:model-value="(value: number) => updateFormField('episodes', value)"
          />
        </el-form-item>

        <el-form-item label="最大ステップ数">
          <div class="template-agents__max-steps-controls">
            <el-switch
              :model-value="formData.useDynamicMaxSteps"
              active-text="動的計算"
              inactive-text="カスタム"
              @update:model-value="(value: boolean) => updateFormField('useDynamicMaxSteps', value)"
            />
            <el-input-number
              :model-value="formData.maxSteps"
              :min="10"
              :max="10000"
              :step="100"
              :disabled="formData.useDynamicMaxSteps"
              @update:model-value="(value: number) => updateFormField('maxSteps', value)"
            />
          </div>
          <p class="template-agents__form-hint">{{ maxStepsHint }}</p>
        </el-form-item>

        <el-form-item label="ランダムシード (オプション)">
          <el-input-number
            :model-value="formData.seed"
            :min="TEMPLATE_AGENT_SEED_MIN"
            :max="TEMPLATE_AGENT_SEED_MAX"
            :step="1"
            placeholder="未設定（ランダム）"
            @update:model-value="(value: number | null) => updateFormField('seed', value)"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="isLoading" :disabled="!canExecute" @click="handleExecute">
            {{ executionMode === 'single' ? '実行' : '比較実行' }}
          </el-button>
          <el-button @click="handleReset">リセット</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.template-agents {
  &__mode-card,
  &__config-card {
    margin-bottom: 24px;
  }

  &__mode-group {
    width: 100%;
  }

  &__form {
    max-width: 600px;
  }

  &__max-steps-controls {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  &__form-hint {
    color: var(--el-text-color-secondary, #6b6b6b);
    font-size: 12px;
    margin: 4px 0 0;
  }

  &__option-subtitle {
    color: var(--el-text-color-secondary);
    font-size: 12px;
    margin-left: 8px;
  }
}
</style>
