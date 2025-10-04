<template>
  <aside class="app-sidebar">
    <nav>
      <slot />
    </nav>
  </aside>
</template>

<style lang="scss" scoped>
.app-sidebar {
  width: 240px;
  min-height: 100vh;
  background-color: #1f2937;
  color: #f9fafb;
}
</style>
