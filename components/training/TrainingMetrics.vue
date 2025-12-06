<script setup lang="ts">
import { computed, watch } from 'vue'

import type { TrainingMetricDTO } from '~/types/api'

import type { ChartConfiguration } from 'chart.js/auto'

interface RealtimeMetrics {
  timestep: number
  episode: number
  reward: number
  loss: number | null
  coverageRatio: number | null
  explorationScore: number | null
  threatLevelAvg: number | null
}

interface Props {
  realtimeMetrics: RealtimeMetrics
  metricsHistory?: TrainingMetricDTO[]
}

const props = defineProps<Props>()

// Reward Chart
const rewardChartConfig: ChartConfiguration = {
  type: 'line',
  data: {
    labels: [],
    datasets: [
      {
        label: 'Reward',
        data: [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: 'Reward Progress',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Timestep',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Reward',
        },
      },
    },
  },
}

const rewardChart = useChart(rewardChartConfig)
const rewardCanvas = rewardChart.canvas

// Loss Chart
const lossChartConfig: ChartConfiguration = {
  type: 'line',
  data: {
    labels: [],
    datasets: [
      {
        label: 'Loss',
        data: [],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.1,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: 'Loss Progress',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Timestep',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Loss',
        },
      },
    },
  },
}

const lossChart = useChart(lossChartConfig)
const lossCanvas = lossChart.canvas

// Coverage Chart
const coverageChartConfig: ChartConfiguration = {
  type: 'line',
  data: {
    labels: [],
    datasets: [
      {
        label: 'Coverage Ratio',
        data: [],
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.1,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: 'Coverage Progress',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Timestep',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Coverage Ratio',
        },
        min: 0,
        max: 1,
      },
    },
  },
}

const coverageChart = useChart(coverageChartConfig)
const coverageCanvas = coverageChart.canvas

// Exploration Chart
const explorationChartConfig: ChartConfiguration = {
  type: 'line',
  data: {
    labels: [],
    datasets: [
      {
        label: 'Exploration Score',
        data: [],
        borderColor: 'rgb(255, 206, 86)',
        backgroundColor: 'rgba(255, 206, 86, 0.2)',
        tension: 0.1,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: 'Exploration Progress',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Timestep',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Exploration Score',
        },
      },
    },
  },
}

const explorationChart = useChart(explorationChartConfig)
const explorationCanvas = explorationChart.canvas

// Threat Level Chart
const threatLevelChartConfig: ChartConfiguration = {
  type: 'line',
  data: {
    labels: [],
    datasets: [
      {
        label: 'Avg Threat Level',
        data: [],
        borderColor: 'rgb(255, 159, 64)',
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        tension: 0.1,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: 'Threat Level Progress',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Timestep',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Avg Threat Level',
        },
        min: 0,
        max: 1,
      },
    },
  },
}

const threatLevelChart = useChart(threatLevelChartConfig)
const threatLevelCanvas = threatLevelChart.canvas

// Watch for historical metrics changes
watch(
  () => props.metricsHistory,
  (history) => {
    if (!history || history.length === 0) return

    // Sort by timestep just in case
    const sortedHistory = [...history].sort((a, b) => a.timestep - b.timestep)
    const labels = sortedHistory.map((m) => m.timestep.toString())

    // Update Reward Chart
    rewardChart.replaceData(labels, [{ data: sortedHistory.map((m) => m.reward) }])

    // Update Loss Chart
    lossChart.replaceData(labels, [{ data: sortedHistory.map((m) => m.loss ?? (null as unknown as number)) }])

    // Update Coverage Chart
    coverageChart.replaceData(labels, [
      { data: sortedHistory.map((m) => m.coverage_ratio ?? (null as unknown as number)) },
    ])

    // Update Exploration Chart
    explorationChart.replaceData(labels, [
      { data: sortedHistory.map((m) => m.exploration_score ?? (null as unknown as number)) },
    ])

    // Update Threat Level Chart
    threatLevelChart.replaceData(labels, [
      {
        data: sortedHistory.map((m) => {
          // Flatten additional_metrics if it exists
          interface AdditionalMetrics {
            threat_level_avg?: number
          }
          const am = m.additional_metrics as AdditionalMetrics | null
          return am?.threat_level_avg ?? (null as unknown as number)
        }),
      },
    ])
  },
  { immediate: true }
)

// Watch for realtime metrics changes
watch(
  () => props.realtimeMetrics,
  (newMetrics) => {
    const timestepLabel = newMetrics.timestep.toString()

    // Update Reward Chart
    rewardChart.updateData(0, newMetrics.reward, timestepLabel, 100)

    // Update Loss Chart (if available)
    if (newMetrics.loss !== null) {
      lossChart.updateData(0, newMetrics.loss, timestepLabel, 100)
    }

    // Update Coverage Chart (if available)
    if (newMetrics.coverageRatio !== null) {
      coverageChart.updateData(0, newMetrics.coverageRatio, timestepLabel, 100)
    }

    // Update Exploration Chart (if available)
    if (newMetrics.explorationScore !== null) {
      explorationChart.updateData(0, newMetrics.explorationScore, timestepLabel, 100)
    }

    // Update Threat Level Chart (if available)
    if (newMetrics.threatLevelAvg !== null) {
      threatLevelChart.updateData(0, newMetrics.threatLevelAvg, timestepLabel, 100)
    }
  },
  { deep: true }
)

// Summary stats
const summaryStats = computed(() => {
  // If we have history and no realtime updates yet (or session completed), use the last history item
  const hasRealtime = props.realtimeMetrics.timestep > 0
  const lastHistory =
    props.metricsHistory && props.metricsHistory.length > 0
      ? props.metricsHistory[props.metricsHistory.length - 1]
      : null

  if (!hasRealtime && lastHistory) {
    interface AdditionalMetrics {
      threat_level_avg?: number
    }
    const am = lastHistory.additional_metrics as AdditionalMetrics | null
    const threatLevel = am?.threat_level_avg ?? null

    return {
      currentTimestep: lastHistory.timestep,
      currentEpisode: lastHistory.episode ?? 0,
      latestReward: lastHistory.reward.toFixed(3),
      latestLoss: lastHistory.loss !== null ? lastHistory.loss.toFixed(4) : 'N/A',
      latestCoverage: lastHistory.coverage_ratio !== null ? (lastHistory.coverage_ratio * 100).toFixed(1) + '%' : 'N/A',
      latestExploration: lastHistory.exploration_score !== null ? lastHistory.exploration_score.toFixed(3) : 'N/A',
      latestThreatLevel: threatLevel !== null ? (threatLevel * 100).toFixed(1) + '%' : 'N/A',
    }
  }

  return {
    currentTimestep: props.realtimeMetrics.timestep,
    currentEpisode: props.realtimeMetrics.episode,
    latestReward: props.realtimeMetrics.reward.toFixed(3),
    latestLoss: props.realtimeMetrics.loss !== null ? props.realtimeMetrics.loss.toFixed(4) : 'N/A',
    latestCoverage:
      props.realtimeMetrics.coverageRatio !== null
        ? (props.realtimeMetrics.coverageRatio * 100).toFixed(1) + '%'
        : 'N/A',
    latestExploration:
      props.realtimeMetrics.explorationScore !== null ? props.realtimeMetrics.explorationScore.toFixed(3) : 'N/A',
    latestThreatLevel:
      props.realtimeMetrics.threatLevelAvg !== null
        ? (props.realtimeMetrics.threatLevelAvg * 100).toFixed(1) + '%'
        : 'N/A',
  }
})
</script>

<template>
  <div class="training-metrics">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="training-metrics__summary">
          <template #header>
            <span>Current Metrics</span>
          </template>
          <el-row :gutter="20">
            <el-col :span="4">
              <div class="metric-item">
                <div class="metric-item__label">Timestep</div>
                <div class="metric-item__value">{{ summaryStats.currentTimestep }}</div>
              </div>
            </el-col>
            <el-col :span="4">
              <div class="metric-item">
                <div class="metric-item__label">Episode</div>
                <div class="metric-item__value">{{ summaryStats.currentEpisode }}</div>
              </div>
            </el-col>
            <el-col :span="3">
              <div class="metric-item">
                <div class="metric-item__label">Reward</div>
                <div class="metric-item__value metric-item__value--reward">
                  {{ summaryStats.latestReward }}
                </div>
              </div>
            </el-col>
            <el-col :span="3">
              <div class="metric-item">
                <div class="metric-item__label">Loss</div>
                <div class="metric-item__value metric-item__value--loss">
                  {{ summaryStats.latestLoss }}
                </div>
              </div>
            </el-col>
            <el-col :span="3">
              <div class="metric-item">
                <div class="metric-item__label">Coverage</div>
                <div class="metric-item__value metric-item__value--coverage">
                  {{ summaryStats.latestCoverage }}
                </div>
              </div>
            </el-col>
            <el-col :span="3">
              <div class="metric-item">
                <div class="metric-item__label">Exploration</div>
                <div class="metric-item__value metric-item__value--exploration">
                  {{ summaryStats.latestExploration }}
                </div>
              </div>
            </el-col>
            <el-col :span="4">
              <div class="metric-item">
                <div class="metric-item__label">Threat Level</div>
                <div class="metric-item__value metric-item__value--threat">
                  {{ summaryStats.latestThreatLevel }}
                </div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>Reward Chart</span>
          </template>
          <div class="chart-container">
            <canvas ref="rewardCanvas" />
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>Loss Chart</span>
          </template>
          <div class="chart-container">
            <canvas ref="lossCanvas" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="8">
        <el-card>
          <template #header>
            <span>Coverage Chart</span>
          </template>
          <div class="chart-container">
            <canvas ref="coverageCanvas" />
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header>
            <span>Exploration Chart</span>
          </template>
          <div class="chart-container">
            <canvas ref="explorationCanvas" />
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header>
            <span>Threat Level Chart</span>
          </template>
          <div class="chart-container">
            <canvas ref="threatLevelCanvas" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.training-metrics {
  &__summary {
    .metric-item {
      padding: 10px 0;
      text-align: center;

      &__label {
        color: #909399;
        font-size: 14px;
        margin-bottom: 8px;
      }

      &__value {
        color: #303133;
        font-size: 28px;
        font-weight: bold;

        &--reward {
          color: #67c23a;
        }

        &--loss {
          color: #f56c6c;
        }

        &--coverage {
          color: #409eff;
        }

        &--exploration {
          color: #e6a23c;
        }

        &--threat {
          color: #f56c6c; /* Red for threat */
        }
      }
    }
  }

  .chart-container {
    height: 300px;
    position: relative;
    width: 100%;
  }
}
</style>
