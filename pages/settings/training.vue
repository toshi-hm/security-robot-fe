<script setup lang="ts">
import { QuestionFilled } from '@element-plus/icons-vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { ref } from 'vue'

definePageMeta({
  title: '学習設定',
})

// Training configuration form data
const formRef = ref<FormInstance>()
const trainingForm = ref({
  algorithm: 'ppo' as 'ppo' | 'a3c',
  totalTimesteps: 10000,
  learningRate: 0.0003,
  gamma: 0.99,
  batchSize: 64,
  epochs: 10,
  clipRange: 0.2,
  valueCoefficient: 0.5,
  entropyCoefficient: 0.01,
  maxGradNorm: 0.5,
})

// Form validation rules
const rules: FormRules = {
  totalTimesteps: [
    { required: true, message: '総タイムステップ数は必須です', trigger: 'blur' },
    {
      type: 'number',
      min: 1000,
      max: 1000000,
      message: '総タイムステップ数は1,000から1,000,000の間である必要があります',
      trigger: 'blur',
    },
  ],
  learningRate: [
    { required: true, message: '学習率は必須です', trigger: 'blur' },
    {
      type: 'number',
      min: 0.00001,
      max: 0.01,
      message: '学習率は0.00001から0.01の間である必要があります',
      trigger: 'blur',
    },
  ],
  gamma: [
    { required: true, message: 'ガンマ値は必須です', trigger: 'blur' },
    {
      type: 'number',
      min: 0.9,
      max: 0.9999,
      message: 'ガンマ値は0.9から0.9999の間である必要があります',
      trigger: 'blur',
    },
  ],
  batchSize: [
    { required: true, message: 'バッチサイズは必須です', trigger: 'blur' },
    { type: 'number', min: 8, max: 512, message: 'バッチサイズは8から512の間である必要があります', trigger: 'blur' },
  ],
  epochs: [
    { required: true, message: 'エポック数は必須です', trigger: 'blur' },
    { type: 'number', min: 1, max: 100, message: 'エポック数は1から100の間である必要があります', trigger: 'blur' },
  ],
}

// Algorithm descriptions
const algorithmDescriptions = {
  ppo: 'Proximal Policy Optimization - クリップ目的関数による安定的でサンプル効率の良いアルゴリズム',
  a3c: 'Asynchronous Advantage Actor-Critic - 複数の並列ワーカーによる高速でロバストなアルゴリズム',
}

// Parameter tooltips with detailed explanations
const parameterTooltips = {
  algorithm: 'どの強化学習アルゴリズムを使用するかを選択します。PPOは安定性が高く、A3Cは高速な学習が可能です。',
  totalTimesteps:
    '学習全体で環境とやり取りする総ステップ数。値が大きいほど学習時間が長くなりますが、より良い性能を得られる可能性があります。',
  learningRate:
    'ニューラルネットワークの重みを更新する速度。大きすぎると学習が不安定になり、小さすぎると学習が遅くなります。',
  gamma: '将来の報酬をどの程度重視するかを決める割引率。1に近いほど長期的な報酬を重視します。',
  batchSize: '一度に学習に使用するサンプル数。大きいほど安定しますがメモリを多く使用します。',
  epochs: '収集したデータを何回学習に使用するか。多いほど学習が進みますが、過学習のリスクもあります。',
  clipRange: 'PPOアルゴリズムで、ポリシーの更新幅を制限するパラメータ。小さいほど安定しますが学習が遅くなります。',
  valueCoefficient: '価値関数の損失をどの程度重視するか。大きいほど価値推定の精度が向上します。',
  entropyCoefficient:
    '行動の多様性をどの程度奨励するか。大きいほど探索的になり、小さいほど既知の良い行動に集中します。',
  maxGradNorm: '勾配の大きさの上限。学習の安定性を保つために勾配爆発を防ぎます。',
}

// Navigation
const goBack = () => {
  return navigateTo('/settings')
}

// Form actions
const saveSettings = async () => {
  if (!formRef.value) return

  try {
    const isValid = await formRef.value.validate()
    if (!isValid) return

    // In a real implementation, this would save to localStorage or backend
    localStorage.setItem('trainingSettings', JSON.stringify(trainingForm.value))

    ElMessage.success('学習設定を保存しました')
  } catch {
    ElMessage.error('学習設定の保存に失敗しました')
  }
}

const resetSettings = () => {
  formRef.value?.resetFields()
  ElMessage.info('学習設定をデフォルトにリセットしました')
}

const loadPreset = (preset: 'fast' | 'balanced' | 'quality') => {
  const presets = {
    fast: {
      algorithm: 'a3c' as const,
      totalTimesteps: 5000,
      learningRate: 0.001,
      gamma: 0.95,
      batchSize: 32,
      epochs: 5,
      clipRange: 0.2,
      valueCoefficient: 0.5,
      entropyCoefficient: 0.01,
      maxGradNorm: 0.5,
    },
    balanced: {
      algorithm: 'ppo' as const,
      totalTimesteps: 10000,
      learningRate: 0.0003,
      gamma: 0.99,
      batchSize: 64,
      epochs: 10,
      clipRange: 0.2,
      valueCoefficient: 0.5,
      entropyCoefficient: 0.01,
      maxGradNorm: 0.5,
    },
    quality: {
      algorithm: 'ppo' as const,
      totalTimesteps: 50000,
      learningRate: 0.0001,
      gamma: 0.995,
      batchSize: 128,
      epochs: 20,
      clipRange: 0.2,
      valueCoefficient: 0.5,
      entropyCoefficient: 0.005,
      maxGradNorm: 0.5,
    },
  }

  trainingForm.value = { ...presets[preset] }
  const presetNames = { fast: '高速学習', balanced: 'バランス', quality: '高品質' }
  ElMessage.success(`"${presetNames[preset]}" プリセットを読み込みました`)
}

// Load saved settings on mount
const loadSettings = () => {
  const saved = localStorage.getItem('trainingSettings')
  if (saved) {
    try {
      trainingForm.value = JSON.parse(saved)
    } catch (error) {
      console.error('Failed to load saved settings:', error)
    }
  }
}

onMounted(() => {
  loadSettings()
})
</script>

<template>
  <div class="training-settings">
    <el-card class="training-settings__header">
      <template #header>
        <h2 class="training-settings__title">学習設定</h2>
      </template>
      <p class="training-settings__description">強化学習のデフォルトパラメータを調整します。</p>
    </el-card>

    <el-card class="training-settings__presets">
      <template #header>
        <span>クイックプリセット</span>
      </template>
      <el-space>
        <el-button @click="loadPreset('fast')">高速学習</el-button>
        <el-button type="primary" @click="loadPreset('balanced')">バランス</el-button>
        <el-button @click="loadPreset('quality')">高品質</el-button>
      </el-space>
      <div class="training-settings__preset-hint">異なる学習シナリオ用の事前定義された設定を読み込みます</div>
    </el-card>

    <el-card class="training-settings__form-card">
      <el-form ref="formRef" :model="trainingForm" :rules="rules" label-width="200px" label-position="left">
        <el-divider content-position="left">アルゴリズム</el-divider>

        <el-form-item prop="algorithm">
          <template #label>
            <span class="training-settings__label">
              アルゴリズム
              <el-tooltip :content="parameterTooltips.algorithm" placement="top">
                <el-icon class="training-settings__help-icon">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </span>
          </template>
          <el-radio-group v-model="trainingForm.algorithm">
            <el-radio value="ppo">PPO</el-radio>
            <el-radio value="a3c">A3C</el-radio>
          </el-radio-group>
          <div class="training-settings__hint">
            {{ algorithmDescriptions[trainingForm.algorithm] }}
          </div>
        </el-form-item>

        <el-divider content-position="left">学習期間</el-divider>

        <el-form-item prop="totalTimesteps">
          <template #label>
            <span class="training-settings__label">
              総タイムステップ数
              <el-tooltip :content="parameterTooltips.totalTimesteps" placement="top">
                <el-icon class="training-settings__help-icon">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </span>
          </template>
          <el-input-number v-model="trainingForm.totalTimesteps" :min="1000" :max="1000000" :step="1000" />
          <span class="training-settings__hint">環境とのインタラクション総数 (1,000 - 1,000,000)</span>
        </el-form-item>

        <el-divider content-position="left">最適化パラメータ</el-divider>

        <el-form-item prop="learningRate">
          <template #label>
            <span class="training-settings__label">
              学習率
              <el-tooltip :content="parameterTooltips.learningRate" placement="top">
                <el-icon class="training-settings__help-icon">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </span>
          </template>
          <el-input-number
            v-model="trainingForm.learningRate"
            :min="0.00001"
            :max="0.01"
            :step="0.0001"
            :precision="5"
          />
          <span class="training-settings__hint">勾配降下法のステップサイズ (0.00001 - 0.01)</span>
        </el-form-item>

        <el-form-item prop="gamma">
          <template #label>
            <span class="training-settings__label">
              ガンマ (γ)
              <el-tooltip :content="parameterTooltips.gamma" placement="top">
                <el-icon class="training-settings__help-icon">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </span>
          </template>
          <el-slider v-model="trainingForm.gamma" :min="0.9" :max="0.9999" :step="0.001" :precision="4" show-input />
          <span class="training-settings__hint">将来の報酬の割引率 (0.9 - 0.9999)</span>
        </el-form-item>

        <el-form-item prop="batchSize">
          <template #label>
            <span class="training-settings__label">
              バッチサイズ
              <el-tooltip :content="parameterTooltips.batchSize" placement="top">
                <el-icon class="training-settings__help-icon">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </span>
          </template>
          <el-select v-model="trainingForm.batchSize" placeholder="バッチサイズを選択">
            <el-option :value="8" label="8" />
            <el-option :value="16" label="16" />
            <el-option :value="32" label="32" />
            <el-option :value="64" label="64" />
            <el-option :value="128" label="128" />
            <el-option :value="256" label="256" />
            <el-option :value="512" label="512" />
          </el-select>
          <span class="training-settings__hint">学習バッチあたりのサンプル数 (8 - 512)</span>
        </el-form-item>

        <el-form-item prop="epochs">
          <template #label>
            <span class="training-settings__label">
              エポック数
              <el-tooltip :content="parameterTooltips.epochs" placement="top">
                <el-icon class="training-settings__help-icon">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </span>
          </template>
          <el-input-number v-model="trainingForm.epochs" :min="1" :max="100" :step="1" />
          <span class="training-settings__hint">各バッチを通過する回数 (1 - 100)</span>
        </el-form-item>

        <el-divider content-position="left">PPO固有パラメータ</el-divider>

        <el-form-item prop="clipRange">
          <template #label>
            <span class="training-settings__label">
              クリップ範囲
              <el-tooltip :content="parameterTooltips.clipRange" placement="top">
                <el-icon class="training-settings__help-icon">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </span>
          </template>
          <el-slider
            v-model="trainingForm.clipRange"
            :min="0.1"
            :max="0.5"
            :step="0.05"
            show-input
            :disabled="trainingForm.algorithm !== 'ppo'"
          />
          <span class="training-settings__hint">PPOクリッピングパラメータ (0.1 - 0.5)</span>
        </el-form-item>

        <el-form-item prop="valueCoefficient">
          <template #label>
            <span class="training-settings__label">
              価値関数係数
              <el-tooltip :content="parameterTooltips.valueCoefficient" placement="top">
                <el-icon class="training-settings__help-icon">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </span>
          </template>
          <el-slider
            v-model="trainingForm.valueCoefficient"
            :min="0.1"
            :max="1.0"
            :step="0.1"
            show-input
            :disabled="trainingForm.algorithm !== 'ppo'"
          />
          <span class="training-settings__hint">価値関数損失の重み (0.1 - 1.0)</span>
        </el-form-item>

        <el-form-item prop="entropyCoefficient">
          <template #label>
            <span class="training-settings__label">
              エントロピー係数
              <el-tooltip :content="parameterTooltips.entropyCoefficient" placement="top">
                <el-icon class="training-settings__help-icon">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </span>
          </template>
          <el-slider
            v-model="trainingForm.entropyCoefficient"
            :min="0.001"
            :max="0.1"
            :step="0.001"
            :precision="3"
            show-input
            :disabled="trainingForm.algorithm !== 'ppo'"
          />
          <span class="training-settings__hint">エントロピーボーナスの重み (0.001 - 0.1)</span>
        </el-form-item>

        <el-form-item prop="maxGradNorm">
          <template #label>
            <span class="training-settings__label">
              最大勾配ノルム
              <el-tooltip :content="parameterTooltips.maxGradNorm" placement="top">
                <el-icon class="training-settings__help-icon">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </span>
          </template>
          <el-slider
            v-model="trainingForm.maxGradNorm"
            :min="0.1"
            :max="2.0"
            :step="0.1"
            show-input
            :disabled="trainingForm.algorithm !== 'ppo'"
          />
          <span class="training-settings__hint">クリッピング用の最大勾配ノルム (0.1 - 2.0)</span>
        </el-form-item>

        <el-form-item>
          <el-space>
            <el-button type="primary" @click="saveSettings">設定を保存</el-button>
            <el-button @click="resetSettings">デフォルトにリセット</el-button>
            <el-button @click="goBack">設定一覧に戻る</el-button>
          </el-space>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.training-settings {
  padding: 20px;

  &__header {
    background-color: var(--md-surface-1);
    border: 1px solid var(--md-outline-variant);
    margin-bottom: 20px;
  }

  &__title {
    color: var(--md-on-surface);
    font-size: 24px;
    font-weight: 600;
    margin: 0;
  }

  &__description {
    color: var(--md-on-surface-variant);
    margin: 0;
  }

  &__presets {
    background-color: var(--md-surface-1);
    border: 1px solid var(--md-outline-variant);
    margin-bottom: 20px;
    max-width: 800px;
  }

  &__preset-hint {
    color: var(--md-on-surface-variant);
    font-size: 12px;
    margin-top: 10px;
  }

  &__form-card {
    background-color: var(--md-surface);
    border: 1px solid var(--md-outline-variant);
    max-width: 800px;
  }

  &__label {
    align-items: center;
    display: inline-flex;
    gap: 6px;
  }

  &__help-icon {
    color: var(--md-on-surface-variant);
    cursor: help;
    font-size: 16px;
    transition: color 0.2s;

    &:hover {
      color: var(--md-primary);
    }
  }

  &__hint {
    color: var(--md-on-surface-variant);
    display: block;
    font-size: 12px;
    line-height: 1.4;
    margin-top: 5px;
  }

  :deep(.el-form-item) {
    margin-bottom: 24px;
  }

  :deep(.el-divider) {
    margin: 30px 0 20px;
  }

  :deep(.el-input-number) {
    width: 180px;
  }

  :deep(.el-slider) {
    margin-right: 20px;
    width: 300px;
  }

  :deep(.el-select) {
    width: 180px;
  }
}
</style>
