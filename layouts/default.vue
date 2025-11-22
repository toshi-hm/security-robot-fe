<script setup lang="ts">
import AppHeader from '~/components/common/AppHeader.vue'
import AppSidebar from '~/components/common/AppSidebar.vue'
</script>

<template>
  <div class="layout-default">
    <AppSidebar class="sidebar">
      <el-menu router>
        <el-menu-item index="/">Dashboard</el-menu-item>
        <el-menu-item index="/training">Training</el-menu-item>
        <el-menu-item index="/playback">Playback</el-menu-item>
        <el-menu-item index="/template-agents">Template Agents</el-menu-item>
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
  background-color: #f3f4f6;
  grid-column: 2 / 3;
  min-height: 100vh;
}
</style>
