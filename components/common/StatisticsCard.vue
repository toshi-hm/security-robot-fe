<script setup lang="ts">
import type { Component } from 'vue'

interface Props {
  title: string
  value: number | string
  label: string
  colorTheme: 'primary' | 'secondary' | 'tertiary'
  icon?: Component | string
  tagText?: string
  tagType?: 'success' | 'warning' | 'info' | 'danger'
}

withDefaults(defineProps<Props>(), {
  tagType: 'success',
})
</script>

<template>
  <el-card :class="['statistics-card', `statistics-card--${colorTheme}`]" shadow="hover">
    <template #header>
      <div class="statistics-card__header">
        <el-icon v-if="icon" :size="24" class="statistics-card__icon">
          <component :is="icon" />
        </el-icon>
        <span class="statistics-card__title">{{ title }}</span>
      </div>
    </template>
    <div class="statistics-card__content">
      <div class="statistics-card__value">{{ value }}</div>
      <div class="statistics-card__label">{{ label }}</div>
      <div v-if="tagText" class="statistics-card__tag">
        <el-tag :type="tagType" effect="plain">
          {{ tagText }}
        </el-tag>
      </div>
    </div>
    <div v-if="$slots.actions" class="statistics-card__actions">
      <slot name="actions" />
    </div>
  </el-card>
</template>

<style scoped lang="scss">
.statistics-card {
  border: 1px solid var(--md-outline-variant);
  border-radius: 8px;
  margin-bottom: 20px;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }

  &__header {
    align-items: center;
    display: flex;
    font-size: 18px;
    font-weight: 600;
    gap: 10px;
  }

  &__icon {
    flex-shrink: 0;
  }

  &__title {
    color: var(--md-on-surface);
  }

  &__content {
    padding: 20px 0;
    text-align: center;
  }

  &__value {
    color: var(--md-on-surface);
    font-size: 48px;
    font-weight: 700;
    line-height: 1;
    margin-bottom: 10px;
  }

  &__label {
    color: var(--md-on-surface-variant);
    font-size: 14px;
    margin-bottom: 15px;
  }

  &__tag {
    display: flex;
    gap: 10px;
    justify-content: center;
  }

  &__actions {
    border-top: 1px solid var(--md-outline-variant);
    display: flex;
    gap: 10px;
    justify-content: center;
    margin-top: 15px;
    padding-top: 15px;
  }

  &--primary {
    background: linear-gradient(135deg, var(--md-primary-container) 0%, var(--md-surface) 100%);
    border-color: var(--md-primary);
    border-top: 4px solid var(--md-primary);

    .statistics-card__icon {
      color: var(--md-primary);
    }

    .statistics-card__title {
      color: var(--md-on-primary-container);
    }

    .statistics-card__value {
      color: var(--md-on-primary-container);
    }
  }

  &--secondary {
    background: linear-gradient(135deg, var(--md-secondary-container) 0%, var(--md-surface) 100%);
    border-color: var(--md-secondary);
    border-top: 4px solid var(--md-secondary);

    .statistics-card__icon {
      color: var(--md-secondary);
    }

    .statistics-card__title {
      color: var(--md-on-secondary-container);
    }

    .statistics-card__value {
      color: var(--md-on-secondary-container);
    }
  }

  &--tertiary {
    background: linear-gradient(135deg, var(--md-tertiary-container) 0%, var(--md-surface) 100%);
    border-color: var(--md-tertiary);
    border-top: 4px solid var(--md-tertiary);

    .statistics-card__icon {
      color: var(--md-tertiary);
    }

    .statistics-card__title {
      color: var(--md-on-tertiary-container);
    }

    .statistics-card__value {
      color: var(--md-on-tertiary-container);
    }
  }
}
</style>
