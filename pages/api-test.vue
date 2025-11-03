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
  background-color: var(--md-background);
  margin: 0 auto;
  max-width: 1200px;
  padding: 2rem;

  &__title {
    color: var(--md-on-background);
    font-size: 2rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  &__description {
    color: var(--md-on-surface-variant);
    margin-bottom: 2rem;
  }

  &__error {
    background: var(--md-error-container);
    border: 1px solid var(--md-error);
    border-radius: 8px;
    margin-bottom: 1rem;
    padding: 1rem;

    pre {
      color: var(--md-error);
      margin: 0.5rem 0 0;
    }
  }

  &__section {
    background-color: var(--md-surface);
    border: 1px solid var(--md-outline-variant);
    border-radius: 8px;
    margin-bottom: 2rem;
    padding: 1rem;

    h2 {
      color: var(--md-on-surface);
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }
  }

  &__button {
    background: var(--md-primary);
    border: none;
    border-radius: 8px;
    color: var(--md-on-primary);
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
    padding: 0.5rem 1rem;
    transition: background-color 0.2s;

    &:hover {
      filter: brightness(0.9);
    }
  }

  &__result {
    background: var(--md-surface-2);
    border: 1px solid var(--md-outline-variant);
    border-radius: 8px;
    color: var(--md-on-surface);
    font-size: 0.9rem;
    margin-top: 1rem;
    overflow-x: auto;
    padding: 1rem;
  }

  &__info {
    background: var(--md-primary-container);
    border: 1px solid var(--md-primary);
    border-radius: 8px;
    margin-top: 2rem;
    padding: 1rem;

    h3 {
      color: var(--md-on-primary-container);
      margin-bottom: 0.5rem;
    }

    p {
      color: var(--md-on-primary-container);
    }

    code {
      background: var(--md-surface);
      border-radius: 4px;
      color: var(--md-primary);
      font-family: monospace;
      padding: 0.2rem 0.4rem;
    }
  }
}
</style>
