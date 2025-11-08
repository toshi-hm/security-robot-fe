<script setup lang="ts">
interface Props {
  status: string
}

const props = defineProps<Props>()

const getStatusType = (status: string): 'success' | 'warning' | 'info' | 'danger' => {
  switch (status) {
    case 'running':
      return 'success'
    case 'paused':
      return 'warning'
    case 'completed':
      return 'info'
    case 'failed':
      return 'danger'
    default:
      return 'info'
  }
}

const getStatusText = (status: string): string => {
  switch (status) {
    case 'running':
      return '実行中'
    case 'paused':
      return '一時停止'
    case 'completed':
      return '完了'
    case 'failed':
      return '失敗'
    case 'created':
      return '作成済み'
    default:
      return status
  }
}
</script>

<template>
  <el-tag :type="getStatusType(props.status)" size="small">
    {{ getStatusText(props.status) }}
  </el-tag>
</template>
