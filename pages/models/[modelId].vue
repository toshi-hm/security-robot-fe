<script setup lang="ts">
import { computed } from 'vue'

const route = useRoute()
const modelId = computed(() => route.params.modelId as string)
</script>

<template>
  <section class="model-detail">
    <h2 class="model-detail__title">モデル詳細: {{ modelId }}</h2>
    <p class="model-detail__description">
      個別モデルの評価メトリクス、ハイパーパラメータ、エクスポート手順などは今後の開発で補完されます。
    </p>
  </section>
</template>

<style lang="scss" scoped>
.model-detail {
  padding: 20px;

  &__title {
    color: var(--md-on-background);
    font-size: 1.75rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
  }

  &__description {
    color: var(--md-on-surface-variant);
  }
}
</style>
