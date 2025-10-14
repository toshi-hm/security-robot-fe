<script setup lang="ts">
import { QuestionFilled } from '@element-plus/icons-vue'
import { ref } from 'vue'

import type { TrainingConfig } from '~/libs/domains/training/TrainingConfig'

const { createSession, isLoading } = useTraining()
const router = useRouter()

const formRef = ref()
const showForm = ref(false)

const trainingConfig = ref<TrainingConfig>({
  name: '',
  algorithm: 'ppo',
  environmentType: 'standard',
  totalTimesteps: 10000,
  envWidth: 8,
  envHeight: 8,
  coverageWeight: 1.5,
  explorationWeight: 3.0,
  diversityWeight: 2.0,
})

const rules = {
  name: [
    { required: true, message: 'セッション名は必須です', trigger: 'blur' },
    { min: 3, max: 50, message: '3文字から50文字の間で入力してください', trigger: 'blur' },
  ],
  totalTimesteps: [
    { required: true, message: '総タイムステップ数は必須です', trigger: 'blur' },
    {
      type: 'number' as 'number',
      min: 1000,
      max: 1000000,
      message: '1,000から1,000,000の間で設定してください',
      trigger: 'blur',
    },
  ],
}

// Parameter tooltips with detailed explanations
const parameterTooltips = {
  name: '学習セッションを識別するための名前。後で確認しやすい名前を付けてください。',
  algorithm: '使用する強化学習アルゴリズム。PPOは安定性が高く、A3Cは高速です。',
  environmentType: '学習に使用する環境のタイプ。標準環境は基本的な設定、拡張環境はより複雑な設定です。',
  totalTimesteps: '学習全体で環境とやり取りする総ステップ数。値が大きいほど学習時間が長くなります。',
  envWidth: '環境のグリッド幅。大きいほど探索空間が広くなります。',
  envHeight: '環境のグリッド高さ。大きいほど探索空間が広くなります。',
  coverageWeight: 'エリアカバー率に対する報酬の重み。大きいほどカバー率を優先します。',
  explorationWeight: '新しいエリアの探索に対する報酬の重み。大きいほど探索を促進します。',
  diversityWeight: '行動の多様性に対する報酬の重み。大きいほど多様な行動を促進します。',
}

const startTraining = async () => {
  if (!formRef.value) return

  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  const session = await createSession(trainingConfig.value)
  if (session) {
    ElMessage.success(`学習セッション「${session.name}」を開始しました`)
    showForm.value = false

    // Navigate to session detail page
    router.push(`/training/${session.id}`)
  } else {
    ElMessage.error('学習セッションの開始に失敗しました')
  }
}

const cancelForm = () => {
  showForm.value = false
  formRef.value?.resetFields()
}
</script>

<template>
  <div class="training-control">
    <div v-if="!showForm" class="training-control__start">
      <el-button type="primary" size="large" :icon="'el-icon-video-play'" @click="showForm = true">
        新規学習セッションを開始
      </el-button>
    </div>

    <el-card v-else class="training-control__form">
      <template #header>
        <span>新規学習セッション設定</span>
      </template>

      <el-form ref="formRef" :model="trainingConfig" :rules="rules" label-width="160px" label-position="left">
        <el-form-item prop="name">
          <template #label>
            <span class="training-control__label">
              セッション名
              <el-tooltip :content="parameterTooltips.name" placement="top">
                <el-icon class="training-control__help-icon">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </span>
          </template>
          <el-input v-model="trainingConfig.name" placeholder="例: PPO学習 実行1" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item prop="algorithm">
              <template #label>
                <span class="training-control__label">
                  アルゴリズム
                  <el-tooltip :content="parameterTooltips.algorithm" placement="top">
                    <el-icon class="training-control__help-icon">
                      <QuestionFilled />
                    </el-icon>
                  </el-tooltip>
                </span>
              </template>
              <el-select v-model="trainingConfig.algorithm" style="width: 100%">
                <el-option label="PPO (Proximal Policy Optimization)" value="ppo" />
                <el-option label="A3C (Asynchronous Advantage Actor-Critic)" value="a3c" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="environmentType">
              <template #label>
                <span class="training-control__label">
                  環境タイプ
                  <el-tooltip :content="parameterTooltips.environmentType" placement="top">
                    <el-icon class="training-control__help-icon">
                      <QuestionFilled />
                    </el-icon>
                  </el-tooltip>
                </span>
              </template>
              <el-select v-model="trainingConfig.environmentType" style="width: 100%">
                <el-option label="標準環境" value="standard" />
                <el-option label="拡張環境" value="enhanced" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item prop="totalTimesteps">
          <template #label>
            <span class="training-control__label">
              総タイムステップ数
              <el-tooltip :content="parameterTooltips.totalTimesteps" placement="top">
                <el-icon class="training-control__help-icon">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </span>
          </template>
          <el-input-number
            v-model="trainingConfig.totalTimesteps"
            :min="1000"
            :max="1000000"
            :step="1000"
            style="width: 100%"
          />
        </el-form-item>

        <el-divider content-position="left">環境設定</el-divider>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item>
              <template #label>
                <span class="training-control__label">
                  環境の幅
                  <el-tooltip :content="parameterTooltips.envWidth" placement="top">
                    <el-icon class="training-control__help-icon">
                      <QuestionFilled />
                    </el-icon>
                  </el-tooltip>
                </span>
              </template>
              <el-input-number v-model="trainingConfig.envWidth" :min="5" :max="50" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item>
              <template #label>
                <span class="training-control__label">
                  環境の高さ
                  <el-tooltip :content="parameterTooltips.envHeight" placement="top">
                    <el-icon class="training-control__help-icon">
                      <QuestionFilled />
                    </el-icon>
                  </el-tooltip>
                </span>
              </template>
              <el-input-number v-model="trainingConfig.envHeight" :min="5" :max="50" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">報酬の重み</el-divider>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item>
              <template #label>
                <span class="training-control__label">
                  カバー率重み
                  <el-tooltip :content="parameterTooltips.coverageWeight" placement="top">
                    <el-icon class="training-control__help-icon">
                      <QuestionFilled />
                    </el-icon>
                  </el-tooltip>
                </span>
              </template>
              <el-input-number
                v-model="trainingConfig.coverageWeight"
                :min="0"
                :max="10"
                :step="0.1"
                :precision="1"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item>
              <template #label>
                <span class="training-control__label">
                  探索重み
                  <el-tooltip :content="parameterTooltips.explorationWeight" placement="top">
                    <el-icon class="training-control__help-icon">
                      <QuestionFilled />
                    </el-icon>
                  </el-tooltip>
                </span>
              </template>
              <el-input-number
                v-model="trainingConfig.explorationWeight"
                :min="0"
                :max="10"
                :step="0.1"
                :precision="1"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item>
              <template #label>
                <span class="training-control__label">
                  多様性重み
                  <el-tooltip :content="parameterTooltips.diversityWeight" placement="top">
                    <el-icon class="training-control__help-icon">
                      <QuestionFilled />
                    </el-icon>
                  </el-tooltip>
                </span>
              </template>
              <el-input-number
                v-model="trainingConfig.diversityWeight"
                :min="0"
                :max="10"
                :step="0.1"
                :precision="1"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item>
          <el-button type="primary" :loading="isLoading" @click="startTraining">学習を開始</el-button>
          <el-button @click="cancelForm">キャンセル</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.training-control {
  &__start {
    padding: 40px 0;
    text-align: center;
  }

  &__form {
    .el-divider {
      margin: 20px 0;
    }
  }

  &__label {
    align-items: center;
    display: inline-flex;
    gap: 6px;
  }

  &__help-icon {
    color: #909399;
    cursor: help;
    font-size: 16px;
    transition: color 0.2s;

    &:hover {
      color: #409eff;
    }
  }
}
</style>
