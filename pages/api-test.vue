<script setup lang="ts">
import { ref } from 'vue'

const healthStatus = ref<string>('')
const trainingListData = ref<string>('')
const environmentData = ref<string>('')
const errorMessage = ref<string>('')

const testHealth = async () => {
  try {
    errorMessage.value = ''
    const response = await $fetch('http://127.0.0.1:8000/api/v1/health/')
    healthStatus.value = JSON.stringify(response, null, 2)
  } catch (error) {
    const err = error as Error
    errorMessage.value = `Health check failed: ${err.message}`
  }
}

const testTrainingList = async () => {
  try {
    errorMessage.value = ''
    const response = await $fetch('http://127.0.0.1:8000/api/v1/training/list', {
      params: { page: 1, page_size: 10 },
    })
    trainingListData.value = JSON.stringify(response, null, 2)
  } catch (error) {
    const err = error as Error
    errorMessage.value = `Training list failed: ${err.message}`
  }
}

const testEnvironmentDefinitions = async () => {
  try {
    errorMessage.value = ''
    const response = await $fetch('http://127.0.0.1:8000/api/v1/environment/definitions')
    environmentData.value = JSON.stringify(response, null, 2)
  } catch (error) {
    const err = error as Error
    errorMessage.value = `Environment definitions failed: ${err.message}`
  }
}
</script>

<template>
  <div class="api-test">
    <h1 class="api-test__title">Backend API Test Page</h1>
    <p class="api-test__description">Test connection to http://127.0.0.1:8000</p>

    <div v-if="errorMessage" class="api-test__error">
      <h3>Error:</h3>
      <pre>{{ errorMessage }}</pre>
    </div>

    <div class="api-test__section">
      <h2>Health Check</h2>
      <button class="api-test__button" @click="testHealth">Test GET /api/v1/health/</button>
      <pre v-if="healthStatus" class="api-test__result">{{ healthStatus }}</pre>
    </div>

    <div class="api-test__section">
      <h2>Training API</h2>
      <button class="api-test__button" @click="testTrainingList">Test GET /api/v1/training/list</button>
      <pre v-if="trainingListData" class="api-test__result">{{ trainingListData }}</pre>
    </div>

    <div class="api-test__section">
      <h2>Environment API</h2>
      <button class="api-test__button" @click="testEnvironmentDefinitions">
        Test GET /api/v1/environment/definitions
      </button>
      <pre v-if="environmentData" class="api-test__result">{{ environmentData }}</pre>
    </div>

    <div class="api-test__info">
      <h3>Backend Status:</h3>
      <p>Make sure the backend server is running at http://127.0.0.1:8000</p>
      <p>Start backend: <code>cd ../security-robot-be && uvicorn app.main:app --reload</code></p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.api-test {
  margin: 0 auto;
  max-width: 1200px;
  padding: 2rem;

  &__title {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  &__description {
    color: #666;
    margin-bottom: 2rem;
  }

  &__error {
    background: #fee;
    border: 1px solid #fcc;
    border-radius: 4px;
    margin-bottom: 1rem;
    padding: 1rem;

    pre {
      color: #c00;
      margin: 0.5rem 0 0;
    }
  }

  &__section {
    border: 1px solid #ddd;
    border-radius: 4px;
    margin-bottom: 2rem;
    padding: 1rem;

    h2 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }
  }

  &__button {
    background: #42b883;
    border: none;
    border-radius: 4px;
    color: white;
    cursor: pointer;
    font-size: 1rem;
    padding: 0.5rem 1rem;

    &:hover {
      background: #35a372;
    }
  }

  &__result {
    background: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.9rem;
    margin-top: 1rem;
    overflow-x: auto;
    padding: 1rem;
  }

  &__info {
    background: #e7f3ff;
    border: 1px solid #b3d9ff;
    border-radius: 4px;
    margin-top: 2rem;
    padding: 1rem;

    h3 {
      margin-bottom: 0.5rem;
    }

    code {
      background: #fff;
      border-radius: 3px;
      font-family: monospace;
      padding: 0.2rem 0.4rem;
    }
  }
}
</style>
