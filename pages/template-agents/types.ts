import type { ComputedRef, ShallowRef } from 'vue'

import type { Position } from '~/libs/domains/common/Position'
import type {
  TemplateAgentEnvironmentInfo,
  TemplateAgentExecuteResponse,
  TemplateAgentFrameData,
  TemplateAgentType,
} from '~/types/api'

export type TemplateAgentExecutionMode = 'single' | 'compare'

export interface TemplateAgentFormData {
  agentType: TemplateAgentType
  compareAgentTypes: TemplateAgentType[]
  width: number
  height: number
  episodes: number
  maxSteps: number
  seed: number | null
  useDynamicMaxSteps: boolean
}

export interface TemplateAgentRouteStats {
  visitedTiles: number
  totalTiles: number
  visitedRatio: number
  stepCount: number
  pathLength: number
  start: Position | null
  end: Position | null
}

export interface TemplateAgentEnvironmentVisualizationProps {
  gridWidth: number
  gridHeight: number
  threatGrid: number[][]
  coverageMap: number[][]
  robotPosition: Position | null
  robotOrientation: number | null
  trajectory: Position[]
  chargingStationPosition: Position | null
}

export type TemplateAgentVisualizationSuspiciousObjects =
  TemplateAgentEnvironmentInfo['suspicious_objects']

export interface TemplateAgentVisualizationState {
  environmentInfo: ComputedRef<TemplateAgentEnvironmentInfo | null>
  playbackFrames: ComputedRef<TemplateAgentFrameData[]>
  latestFrame: ComputedRef<TemplateAgentFrameData | null>
  coverageMap: ComputedRef<number[][]>
  threatGrid: ComputedRef<number[][]>
  robotPosition: ComputedRef<Position | null>
  robotOrientation: ComputedRef<number | null>
  robotTrajectory: ShallowRef<Position[]>
  routeWaypoints: ComputedRef<Position[]>
  routeStats: ComputedRef<TemplateAgentRouteStats>
  environmentVisualizationProps: ComputedRef<TemplateAgentEnvironmentVisualizationProps | null>
  suspiciousObjects: ComputedRef<TemplateAgentVisualizationSuspiciousObjects>
}
