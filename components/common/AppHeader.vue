<script setup lang="ts">
import { APP_TITLE } from '~/configs/constants'

const title = APP_TITLE
</script>

<template>
  <header class="app-header">
    <h1 class="app-header__title">{{ title }}</h1>
  </header>
</template>

<style lang="scss" scoped>
.app-header {
  align-items: center;
  background-color: var(--el-color-primary-light-9);
  display: flex;
  padding: 1rem 1.5rem;

  &__title {
    color: var(--el-color-primary);
    font-weight: 700;
    letter-spacing: 0.04em;
  }
}
</style>
