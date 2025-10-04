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
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  background-color: var(--el-color-primary-light-9);

  &__title {
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
}
</style>
