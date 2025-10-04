<template>
  <div class="layout-default">
    <AppSidebar class="sidebar">
      <el-menu router>
        <el-menu-item index="/">Dashboard</el-menu-item>
        <el-menu-item index="/training">Training</el-menu-item>
        <el-menu-item index="/playback">Playback</el-menu-item>
        <el-menu-item index="/models">Models</el-menu-item>
        <el-menu-item index="/settings">Settings</el-menu-item>
      </el-menu>
    </AppSidebar>
    <main class="content">
      <AppHeader />
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '~/components/common/AppHeader.vue'
import AppSidebar from '~/components/common/AppSidebar.vue'
</script>

<style scoped>
.layout-default {
  display: grid;
  grid-template-columns: 240px 1fr;
  min-height: 100vh;
}

.sidebar {
  grid-column: 1 / 2;
}

.content {
  grid-column: 2 / 3;
  background-color: #f3f4f6;
  min-height: 100vh;
}
</style>
