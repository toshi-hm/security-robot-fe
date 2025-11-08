<script setup lang="ts">
import { computed } from 'vue'

import { SESSION_STATUS_MAP } from '~/configs/constants'

interface Props {
  status: string
}

const props = defineProps<Props>()

const statusConfig = computed(() => {
  const config = SESSION_STATUS_MAP[props.status as keyof typeof SESSION_STATUS_MAP]
  return config || { text: props.status, type: 'info' }
})
</script>

<template>
  <el-tag :type="statusConfig.type" size="small">
    {{ statusConfig.text }}
  </el-tag>
</template>
