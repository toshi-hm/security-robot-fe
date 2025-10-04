<template>
  <section class="models">
    <h2 class="models__title">モデル管理</h2>
    <p class="models__description">
      訓練済みモデルの一覧、比較、エクスポート機能は今後の実装で追加されます。
    </p>
  </section>
</template>

<script setup lang="ts">
const breadcrumb = [
  { label: 'ホーム', to: '/' },
  { label: 'モデル管理' },
]
</script>

<style lang="scss" scoped>
.models {
  &__title {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }

  &__description {
    color: #cbd5f5;
  }
}
</style>
