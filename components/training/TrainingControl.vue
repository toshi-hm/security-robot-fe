<script setup lang="ts">
import { ref } from 'vue'

import type { TrainingConfig } from '~/libs/repositories/training/TrainingRepository'

import type { FormInstance } from 'element-plus'

const { createSession, isLoading } = useTraining()
const router = useRouter()

const formRef = ref<FormInstance>()
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
    { required: true, message: 'Session name is required', trigger: 'blur' },
    { min: 3, max: 50, message: 'Length should be 3 to 50 characters', trigger: 'blur' },
  ],
  totalTimesteps: [
    { required: true, message: 'Total timesteps is required', trigger: 'blur' },
    { type: 'number', min: 1000, max: 1000000, message: 'Must be between 1,000 and 1,000,000', trigger: 'blur' },
  ],
}

const startTraining = async () => {
  if (!formRef.value) return

  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  const session = await createSession(trainingConfig.value)
  if (session) {
    ElMessage.success(`Training session "${session.name}" started successfully!`)
    showForm.value = false

    // Navigate to session detail page
    router.push(`/training/${session.id}`)
  } else {
    ElMessage.error('Failed to start training session')
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
        Start New Training Session
      </el-button>
    </div>

    <el-card v-else class="training-control__form">
      <template #header>
        <span>New Training Session Configuration</span>
      </template>

      <el-form ref="formRef" :model="trainingConfig" :rules="rules" label-width="160px" label-position="left">
        <el-form-item label="Session Name" prop="name">
          <el-input v-model="trainingConfig.name" placeholder="e.g., PPO Training Run 1" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Algorithm" prop="algorithm">
              <el-select v-model="trainingConfig.algorithm" style="width: 100%">
                <el-option label="PPO (Proximal Policy Optimization)" value="ppo" />
                <el-option label="A3C (Asynchronous Advantage Actor-Critic)" value="a3c" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Environment Type" prop="environmentType">
              <el-select v-model="trainingConfig.environmentType" style="width: 100%">
                <el-option label="Standard Environment" value="standard" />
                <el-option label="Enhanced Environment" value="enhanced" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="Total Timesteps" prop="totalTimesteps">
          <el-input-number
            v-model="trainingConfig.totalTimesteps"
            :min="1000"
            :max="1000000"
            :step="1000"
            style="width: 100%"
          />
        </el-form-item>

        <el-divider content-position="left">Environment Settings</el-divider>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Environment Width">
              <el-input-number v-model="trainingConfig.envWidth" :min="5" :max="50" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Environment Height">
              <el-input-number v-model="trainingConfig.envHeight" :min="5" :max="50" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">Reward Weights</el-divider>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="Coverage Weight">
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
            <el-form-item label="Exploration Weight">
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
            <el-form-item label="Diversity Weight">
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
          <el-button type="primary" :loading="isLoading" @click="startTraining"> Start Training </el-button>
          <el-button @click="cancelForm">Cancel</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.training-control {
  &__start {
    text-align: center;
    padding: 40px 0;
  }

  &__form {
    .el-divider {
      margin: 20px 0;
    }
  }
}
</style>
