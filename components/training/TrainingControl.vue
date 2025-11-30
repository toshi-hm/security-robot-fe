<script setup lang="ts">
import { QuestionFilled } from '@element-plus/icons-vue'
import { ref } from 'vue'

import { TRAINING_CONSTRAINTS, type TrainingConfig, type MapType } from '~/libs/domains/training/TrainingConfig'

const { createSession, isLoading, error } = useTraining()
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
  // Map Configuration
  mapConfig: {
    mapType: 'random' as MapType,
    count: 10,
    seed: undefined,
    initialWallProbability: undefined,
  },
  // Advanced Settings (optional)
  learningRate: 0.0003,
  batchSize: 64,
  numWorkers: 1,
  numRobots: 1,
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
  // Map Configuration
  mapType: 'マップの生成タイプ。Random=ランダム配置、Maze=迷路、Room=部屋構造、Cave=洞窟風',
  seed: 'マップ生成のシード値。同じシードで同じマップが生成されます。空欄の場合はランダム。',
  count: 'ランダムマップタイプで配置する障害物の数。',
  initialWallProbability: '洞窟マップタイプで初期壁が生成される確率(0.0-1.0)。',
  // Advanced Settings
  learningRate:
    'ニューラルネットワークの重みを更新する速度。大きすぎると学習が不安定になり、小さすぎると学習が遅くなります。推奨値: 0.0003',
  batchSize: '1回の更新で使用するサンプル数。大きいほど安定しますが、メモリを多く使用します。推奨値: 64',
  numWorkers: '並列実行するワーカー数（A3C使用時のみ有効）。CPUコア数に応じて調整してください。推奨値: 1-4',
}

/**
 * エラーステータスコードに応じたメッセージマッピング
 */
const getErrorMessage = (error: unknown): string => {
  const errorMessages: Record<number, string> = {
    400: 'セッション設定が無効です。パラメータを確認してください。',
    401: '認証が必要です。ログインし直してください。',
    403: 'アクセス権限がありません。',
    404: '指定されたリソースが見つかりません。',
    408: 'リクエストがタイムアウトしました。',
    500: 'サーバー内部エラーが発生しました。',
    502: 'トレーニングワーカーが起動していません。少々お待ちください。',
    503: 'サーバーが高負荷状態です。後でお試しください。',
    504: 'サーバーからの応答がタイムアウトしました。',
  }

  // エラーオブジェクトからステータスコードを取得
  const apiError = error as { status?: number; response?: { status?: number }; message?: string }
  const status = apiError?.status || apiError?.response?.status

  if (status && errorMessages[status]) {
    return errorMessages[status]
  }

  // タイムアウトエラー
  if (apiError?.message?.includes('タイムアウト')) {
    return 'API応答タイムアウト。Workerが起動していない可能性があります。'
  }

  // デフォルトメッセージ
  return apiError?.message || '学習セッションの開始に失敗しました'
}

const startTraining = async () => {
  if (!formRef.value) return

  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  try {
    const session = await createSession(trainingConfig.value)
    if (session) {
      ElMessage.success(`学習セッション「${session.name}」を開始しました`)
      showForm.value = false

      // Navigate to session detail page
      router.push(`/training/${session.id}`)
    } else {
      // createSessionがnullを返した場合（エラーが発生した場合）
      const errorMsg = error.value || '学習セッションの開始に失敗しました'
      ElMessage.error(`開始に失敗しました: ${errorMsg}`)
    }
  } catch (err) {
    // 予期しないエラーをキャッチ
    const errorMsg = getErrorMessage(err)
    ElMessage.error(`開始に失敗しました: ${errorMsg}`)
    console.error('Training session creation error:', err)
  }
}

const openForm = () => {
  showForm.value = true
}

const cancelForm = () => {
  showForm.value = false
  formRef.value?.resetFields()
}
</script>

<template>
  <div class="training-control">
    <div v-if="!showForm" class="training-control__start">
      <el-button type="primary" size="large" :icon="'el-icon-video-play'" @click="openForm">
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

        <el-divider content-position="left">マップ設定</el-divider>

        <div v-if="trainingConfig.mapConfig">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item>
                <template #label>
                  <span class="training-control__label">
                    マップタイプ
                    <el-tooltip :content="parameterTooltips.mapType" placement="top">
                      <el-icon class="training-control__help-icon">
                        <QuestionFilled />
                      </el-icon>
                    </el-tooltip>
                  </span>
                </template>
                <el-select v-model="trainingConfig.mapConfig.mapType" style="width: 100%">
                  <el-option label="Random (ランダム配置)" value="random" />
                  <el-option label="Maze (迷路)" value="maze" />
                  <el-option label="Room (部屋構造)" value="room" />
                  <el-option label="Cave (洞窟風)" value="cave" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item>
                <template #label>
                  <span class="training-control__label">
                    シード値 (オプション)
                    <el-tooltip :content="parameterTooltips.seed" placement="top">
                      <el-icon class="training-control__help-icon">
                        <QuestionFilled />
                      </el-icon>
                    </el-tooltip>
                  </span>
                </template>
                <el-input-number
                  v-model="trainingConfig.mapConfig.seed"
                  :min="0"
                  :max="999999"
                  placeholder="ランダム"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row v-if="trainingConfig.mapConfig.mapType === 'random'" :gutter="20">
            <el-col :span="12">
              <el-form-item>
                <template #label>
                  <span class="training-control__label">
                    障害物数
                    <el-tooltip :content="parameterTooltips.count" placement="top">
                      <el-icon class="training-control__help-icon">
                        <QuestionFilled />
                      </el-icon>
                    </el-tooltip>
                  </span>
                </template>
                <el-input-number
                  v-model="trainingConfig.mapConfig.count"
                  :min="TRAINING_CONSTRAINTS.mapConfig.count.min"
                  :max="TRAINING_CONSTRAINTS.mapConfig.count.max"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row v-if="trainingConfig.mapConfig.mapType === 'cave'" :gutter="20">
            <el-col :span="12">
              <el-form-item>
                <template #label>
                  <span class="training-control__label">
                    初期壁生成確率
                    <el-tooltip :content="parameterTooltips.initialWallProbability" placement="top">
                      <el-icon class="training-control__help-icon">
                        <QuestionFilled />
                      </el-icon>
                    </el-tooltip>
                  </span>
                </template>
                <el-input-number
                  v-model="trainingConfig.mapConfig.initialWallProbability"
                  :min="TRAINING_CONSTRAINTS.mapConfig.initialWallProbability.min"
                  :max="TRAINING_CONSTRAINTS.mapConfig.initialWallProbability.max"
                  :step="TRAINING_CONSTRAINTS.mapConfig.initialWallProbability.step"
                  :precision="2"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

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

        <el-divider content-position="left">詳細設定 (オプション)</el-divider>

        <el-collapse class="training-control__advanced-settings">
          <el-collapse-item title="Advanced Settings" name="advanced">
            <template #title>
              <span class="training-control__collapse-title"> Advanced Settings（上級者向け） </span>
            </template>

            <el-alert type="info" :closable="false" show-icon class="training-control__advanced-note">
              <template #default>
                デフォルト値で適切に設定されています。変更が不要な場合はそのまま学習を開始してください。
              </template>
            </el-alert>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item>
                  <template #label>
                    <span class="training-control__label">
                      学習率
                      <el-tooltip :content="parameterTooltips.learningRate" placement="top">
                        <el-icon class="training-control__help-icon">
                          <QuestionFilled />
                        </el-icon>
                      </el-tooltip>
                    </span>
                  </template>
                  <el-input-number
                    v-model="trainingConfig.learningRate"
                    :min="TRAINING_CONSTRAINTS.learningRate.min"
                    :max="TRAINING_CONSTRAINTS.learningRate.max"
                    :step="TRAINING_CONSTRAINTS.learningRate.step"
                    :precision="TRAINING_CONSTRAINTS.learningRate.precision"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item>
                  <template #label>
                    <span class="training-control__label">
                      バッチサイズ
                      <el-tooltip :content="parameterTooltips.batchSize" placement="top">
                        <el-icon class="training-control__help-icon">
                          <QuestionFilled />
                        </el-icon>
                      </el-tooltip>
                    </span>
                  </template>
                  <el-input-number
                    v-model="trainingConfig.batchSize"
                    :min="TRAINING_CONSTRAINTS.batchSize.min"
                    :max="TRAINING_CONSTRAINTS.batchSize.max"
                    :step="TRAINING_CONSTRAINTS.batchSize.step"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item>
                  <template #label>
                    <span class="training-control__label">
                      ワーカー数
                      <el-tooltip :content="parameterTooltips.numWorkers" placement="top">
                        <el-icon class="training-control__help-icon">
                          <QuestionFilled />
                        </el-icon>
                      </el-tooltip>
                    </span>
                  </template>
                  <el-input-number
                    v-model="trainingConfig.numWorkers"
                    :min="TRAINING_CONSTRAINTS.numWorkers.min"
                    :max="TRAINING_CONSTRAINTS.numWorkers.max"
                    :step="TRAINING_CONSTRAINTS.numWorkers.step"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item>
                  <template #label>
                    <span class="training-control__label">
                      ロボット数
                      <el-tooltip content="環境に配置するロボットの数（マルチエージェント学習）" placement="top">
                        <el-icon class="training-control__help-icon">
                          <QuestionFilled />
                        </el-icon>
                      </el-tooltip>
                    </span>
                  </template>
                  <el-input-number v-model="trainingConfig.numRobots" :min="1" :max="10" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-collapse-item>
        </el-collapse>

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

  &__advanced-settings {
    margin-bottom: 20px;
  }

  &__collapse-title {
    color: #606266;
    font-size: 14px;
    font-weight: 500;
  }

  &__advanced-note {
    margin-bottom: 20px;
  }
}
</style>
