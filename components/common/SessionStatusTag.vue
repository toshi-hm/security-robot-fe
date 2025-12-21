<script setup lang="ts">
import { computed } from 'vue'

import { SESSION_STATUS_MAP, type SessionStatusConfig } from '~/configs/constants'

interface Props {
  status: string
}

const props = defineProps<Props>()

const statusConfig = computed<SessionStatusConfig>(() => {
  const config = SESSION_STATUS_MAP[props.status as keyof typeof SESSION_STATUS_MAP]
  return config || { text: props.status, type: 'info' }
})
</script>

<template>
  <el-tag
    :type="statusConfig.type"
    :color="statusConfig.color"
    size="small"
    :style="statusConfig.textColor ? { color: statusConfig.textColor } : undefined"
  >
    {{ statusConfig.text }}
  </el-tag>
</template>
