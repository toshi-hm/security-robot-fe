<template>
  <div class="loading-spinner" role="status" aria-live="polite">
    <el-icon class="spinner"><i class="el-icon-loading" /></el-icon>
    <span class="sr-only">Loading...</span>
  </div>
</template>

<style lang="scss" scoped>
.loading-spinner {
  align-items: center;
  display: flex;
  gap: 0.5rem;
}

.spinner {
  animation: spin 1.2s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
