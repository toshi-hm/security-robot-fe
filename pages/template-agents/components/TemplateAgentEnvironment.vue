<script setup lang="ts">
import EnvironmentVisualization from '~/components/environment/EnvironmentVisualization.vue'
import type { Position } from '~/libs/domains/common/Position'
import type { TemplateAgentEnvironmentInfo, TemplateAgentExecuteResponse } from '~/types/api'
import type {
  TemplateAgentEnvironmentVisualizationProps,
  TemplateAgentRouteStats,
  TemplateAgentVisualizationSuspiciousObjects,
} from '../types'
import { calculateAverageThreat, calculateMaxThreat, countObstacles } from '~/utils/gridHelpers'

const props = defineProps<{
  executeResult: TemplateAgentExecuteResponse
  environmentInfo: TemplateAgentEnvironmentInfo | null
  environmentVisualizationProps: TemplateAgentEnvironmentVisualizationProps | null
  routeStats: TemplateAgentRouteStats
  routeWaypoints: Position[]
  suspiciousObjects: TemplateAgentVisualizationSuspiciousObjects
}>()

const formatCoordinate = (position: Position | null): string => {
  if (!position) return '-'
  return `(${position.x}, ${position.y})`
}
</script>

<template>
  <el-card class="template-agents__environment-card">
    <template #header>
      <div class="template-agents__env-header">
        <div>
          <div class="template-agents__env-title">環境情報</div>
          <p class="template-agents__env-subtitle">
            {{ executeResult.agent_name }} / {{ executeResult.environment.width }} ×
            {{ executeResult.environment.height }} グリッド
          </p>
        </div>
        <el-tag type="primary" effect="dark"> 実行ID: {{ executeResult.execution_id }} </el-tag>
      </div>
    </template>

    <div v-if="environmentVisualizationProps" class="template-agents__environment-content">
      <div class="template-agents__visualization-wrapper">
        <EnvironmentVisualization
          :grid-width="environmentVisualizationProps.gridWidth"
          :grid-height="environmentVisualizationProps.gridHeight"
          :threat-grid="environmentVisualizationProps.threatGrid"
          :coverage-map="environmentVisualizationProps.coverageMap"
          :robot-position="environmentVisualizationProps.robotPosition"
          :robot-orientation="environmentVisualizationProps.robotOrientation"
          :trajectory="environmentVisualizationProps.trajectory"
          :charging-station-position="environmentVisualizationProps.chargingStationPosition"
        />
      </div>

      <div class="template-agents__environment-details">
        <div class="template-agents__env-section">
          <div class="template-agents__env-section-title">静的情報</div>
          <div class="template-agents__environment-grid">
            <div class="template-agents__env-stat">
              <div class="template-agents__env-label">グリッドサイズ</div>
              <div class="template-agents__env-value">
                {{ environmentInfo?.width ?? '-' }} × {{ environmentInfo?.height ?? '-' }}
              </div>
            </div>
            <div class="template-agents__env-stat">
              <div class="template-agents__env-label">障害物数</div>
              <div class="template-agents__env-value">
                {{ environmentInfo ? countObstacles(environmentInfo.obstacles) : '-' }}
              </div>
            </div>
            <div class="template-agents__env-stat">
              <div class="template-agents__env-label">充電ステーション</div>
              <div class="template-agents__env-value">
                {{ formatCoordinate(environmentVisualizationProps.chargingStationPosition) }}
              </div>
            </div>
            <div class="template-agents__env-stat">
              <div class="template-agents__env-label">不審物数</div>
              <div class="template-agents__env-value">
                {{ suspiciousObjects.length }}
              </div>
            </div>
            <div class="template-agents__env-stat">
              <div class="template-agents__env-label">平均脅威度</div>
              <div class="template-agents__env-value">
                {{
                  environmentInfo?.threat_grid
                    ? calculateAverageThreat(environmentInfo.threat_grid).toFixed(3)
                    : '0.000'
                }}
              </div>
            </div>
            <div class="template-agents__env-stat">
              <div class="template-agents__env-label">最大脅威度</div>
              <div class="template-agents__env-value">
                {{
                  environmentInfo?.threat_grid ? calculateMaxThreat(environmentInfo.threat_grid).toFixed(3) : '0.000'
                }}
              </div>
            </div>
          </div>
        </div>

        <div class="template-agents__env-section">
          <div class="template-agents__env-section-title">巡回サマリー</div>
          <div class="template-agents__environment-grid">
            <div class="template-agents__env-stat">
              <div class="template-agents__env-label">現在位置</div>
              <div class="template-agents__env-value">
                {{ formatCoordinate(environmentVisualizationProps.robotPosition) }}
              </div>
            </div>
            <div class="template-agents__env-stat">
              <div class="template-agents__env-label">開始タイル</div>
              <div class="template-agents__env-value">
                {{ formatCoordinate(routeStats.start) }}
              </div>
            </div>
            <div class="template-agents__env-stat">
              <div class="template-agents__env-label">最新タイル</div>
              <div class="template-agents__env-value">
                {{ formatCoordinate(routeStats.end) }}
              </div>
            </div>
            <div class="template-agents__env-stat">
              <div class="template-agents__env-label">訪問セル</div>
              <div class="template-agents__env-value">
                {{ routeStats.visitedTiles }} / {{ routeStats.totalTiles }}
                <small>({{ routeStats.visitedRatio.toFixed(1) }}%)</small>
              </div>
            </div>
            <div class="template-agents__env-stat">
              <div class="template-agents__env-label">ステップ数</div>
              <div class="template-agents__env-value">
                {{ routeStats.stepCount }}
              </div>
            </div>
            <div class="template-agents__env-stat">
              <div class="template-agents__env-label">巡回タイル数</div>
              <div class="template-agents__env-value">
                {{ routeStats.pathLength }}
              </div>
            </div>
          </div>
        </div>

        <div v-if="suspiciousObjects.length" class="template-agents__env-section">
          <div class="template-agents__env-section-title">不審物一覧</div>
          <ul class="template-agents__objects-list">
            <li v-for="(object, index) in suspiciousObjects" :key="`suspicious-${index}`">
              ({{ object.x }}, {{ object.y }}) - {{ object.type }} / 脅威度 {{ object.threat_level.toFixed(2) }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div v-else class="template-agents__environment-empty">
      <el-empty description="環境情報が付属していません" />
    </div>

    <div v-if="routeWaypoints.length" class="template-agents__route-preview">
      <div class="template-agents__env-section-title">巡回ルート ({{ routeStats.pathLength }} タイル)</div>
      <div class="template-agents__route-list">
        <span
          v-for="(waypoint, index) in routeWaypoints"
          :key="`route-${waypoint.x}-${waypoint.y}-${index}`"
          class="template-agents__waypoint"
        >
          {{ index + 1 }}. ({{ waypoint.x }}, {{ waypoint.y }})
        </span>
      </div>
    </div>
  </el-card>
</template>

<style scoped lang="scss">
.template-agents {
  &__environment-card {
    margin-bottom: 24px;
  }

  &__env-header {
    align-items: center;
    display: flex;
    gap: 16px;
    justify-content: space-between;
  }

  &__env-title {
    color: var(--md-sys-color-on-surface, #1c1b1f);
    font-size: 20px;
    font-weight: 700;
    margin: 0;
  }

  &__env-subtitle {
    color: var(--md-sys-color-on-surface-variant, #49454f);
    font-size: 14px;
    margin: 4px 0 0;
  }

  &__environment-content {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
  }

  &__visualization-wrapper {
    flex: 1 1 480px;
    min-width: 360px;
  }

  &__environment-details {
    display: flex;
    flex: 1 1 320px;
    flex-direction: column;
    gap: 16px;
    min-width: 300px;
  }

  &__env-section {
    background: var(--md-sys-color-surface-container, #f3edf7);
    border: 1px solid var(--md-sys-color-outline-variant, #c9c5d0);
    border-radius: 12px;
    padding: 16px;
  }

  &__env-section-title {
    color: var(--md-sys-color-on-surface, #1c1b1f);
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 12px;
  }

  &__environment-grid {
    display: grid;
    gap: 16px;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }

  &__env-stat {
    background: var(--md-sys-color-surface-container, #f3edf7);
    border-radius: 8px;
    padding: 16px;
    text-align: center;
  }

  &__env-label {
    color: var(--md-sys-color-on-surface-variant, #49454f);
    font-size: 12px;
    margin-bottom: 8px;
  }

  &__env-value {
    color: var(--md-sys-color-on-surface, #1c1b1f);
    font-size: 18px;
    font-weight: 600;
  }

  &__objects-list {
    color: var(--md-sys-color-on-surface, #1c1b1f);
    font-size: 13px;
    list-style: disc;
    margin: 0;
    padding-left: 20px;

    li + li {
      margin-top: 4px;
    }
  }

  &__environment-empty {
    padding: 24px 0;
  }

  &__route-preview {
    margin-top: 24px;
  }

  &__route-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
  }

  &__waypoint {
    background: var(--md-sys-color-surface-variant, #e7e0ec);
    border: 1px solid var(--md-sys-color-outline-variant, #c9c5d0);
    border-radius: 999px;
    color: var(--md-sys-color-on-surface-variant, #49454f);
    font-size: 12px;
    padding: 6px 12px;
  }
}
</style>
