<template>
  <aside class="app-sidebar">
    <nav>
      <slot />
    </nav>
  </aside>
</template>

<style lang="scss" scoped>
.app-sidebar {
  background-color: #1f2937;
  color: #f9fafb;
  min-height: 100vh;
  width: 240px;
}
</style>
