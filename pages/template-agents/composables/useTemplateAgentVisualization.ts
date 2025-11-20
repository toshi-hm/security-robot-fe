import { computed, ref, shallowRef, watch } from 'vue'

import { ROUTE_PREVIEW_LIMIT } from '~/configs/constants'
import type { Position } from '~/libs/domains/common/Position'
import type { TemplateAgentExecuteResponse, TemplateAgentFrameData } from '~/types/api'
import type {
  TemplateAgentEnvironmentVisualizationProps,
  TemplateAgentRouteStats,
  TemplateAgentVisualizationState,
} from '../types'
import { normalizeGridMatrix } from '~/utils/gridHelpers'

export const useTemplateAgentVisualization = (
  executeResult: Readonly<{ value: TemplateAgentExecuteResponse | null }>
): TemplateAgentVisualizationState => {
  const environmentInfo = computed(() => executeResult.value?.environment_info ?? null)

  let cachedExecutionId: string | null = null
  let cachedPlaybacksRef: TemplateAgentExecuteResponse['episode_playbacks'] | null = null
  let cachedPlaybackFrameCount = 0
  let cachedPlaybackFrames: TemplateAgentFrameData[] = []

  const playbackFrames = computed<TemplateAgentFrameData[]>(() => {
    const result = executeResult.value
    const playbacks = result?.episode_playbacks ?? []
    const executionId = result?.execution_id ?? null

    if (!playbacks.length) {
      cachedExecutionId = null
      cachedPlaybacksRef = null
      cachedPlaybackFrameCount = 0
      cachedPlaybackFrames = []
      return cachedPlaybackFrames
    }

    const frameCount = playbacks.reduce((total, episode) => total + (episode.frames?.length ?? 0), 0)

    if (
      executionId === cachedExecutionId &&
      cachedPlaybacksRef === playbacks &&
      cachedPlaybackFrameCount === frameCount &&
      cachedPlaybackFrames.length
    ) {
      return cachedPlaybackFrames
    }

    cachedPlaybackFrames = playbacks.flatMap((episode) => episode.frames ?? [])
    cachedExecutionId = executionId
    cachedPlaybacksRef = playbacks
    cachedPlaybackFrameCount = frameCount

    return cachedPlaybackFrames
  })

  const latestFrame = computed<TemplateAgentFrameData | null>(() => {
    const frames = playbackFrames.value
    if (!frames.length) return null
    return frames[frames.length - 1] ?? null
  })

  const createEmptyCoverageMap = (width: number, height: number): number[][] => {
    if (width <= 0 || height <= 0) return []
    return Array.from({ length: height }, () => Array.from({ length: width }, () => 0))
  }

  const coverageMap = computed<number[][]>(() => {
    if (latestFrame.value?.coverage_map?.length) {
      return normalizeGridMatrix(latestFrame.value.coverage_map)
    }
    const info = environmentInfo.value
    if (!info) return []
    return createEmptyCoverageMap(info.width, info.height)
  })

  const threatGrid = computed<number[][]>(() => {
    if (latestFrame.value?.threat_grid?.length) {
      return normalizeGridMatrix(latestFrame.value.threat_grid)
    }
    const grid = environmentInfo.value?.threat_grid
    if (grid) {
      return normalizeGridMatrix(grid)
    }
    return []
  })

  const robotPosition = computed<Position | null>(() => {
    const frame = latestFrame.value
    if (!frame) return null
    return { x: frame.robot_x, y: frame.robot_y }
  })

  const robotOrientation = computed<number | null>(() => {
    if (typeof latestFrame.value?.robot_orientation === 'number') {
      return latestFrame.value.robot_orientation
    }
    return null
  })

  const robotTrajectory = shallowRef<Position[]>([])
  const processedFrameCount = ref(0)

  const appendTrajectory = (frames: TemplateAgentFrameData[], startIndex: number) => {
    if (!frames.length) {
      robotTrajectory.value = []
      processedFrameCount.value = 0
      return
    }

    let updated = robotTrajectory.value
    let mutated = false

    for (let index = startIndex; index < frames.length; index += 1) {
      const frame = frames[index]
      const previous = updated[updated.length - 1]
      if (!previous || previous.x !== frame.robot_x || previous.y !== frame.robot_y) {
        if (!mutated) {
          updated = [...updated]
          mutated = true
        }
        updated.push({ x: frame.robot_x, y: frame.robot_y })
      }
    }

    if (mutated || startIndex === 0) {
      robotTrajectory.value = updated
    }

    processedFrameCount.value = frames.length
  }

  watch(
    () => playbackFrames.value,
    (frames) => {
      processedFrameCount.value = 0
      robotTrajectory.value = []
      appendTrajectory(frames, 0)
    },
    { immediate: true, deep: false }
  )

  watch(
    () => playbackFrames.value.length,
    (length, previousLength) => {
      const frames = playbackFrames.value

      if (length < previousLength) {
        processedFrameCount.value = 0
        robotTrajectory.value = []
        appendTrajectory(frames, 0)
        return
      }

      if (length === processedFrameCount.value) return

      appendTrajectory(frames, processedFrameCount.value)
    }
  )

  const routeWaypoints = computed<Position[]>(() => {
    const trajectory = robotTrajectory.value
    if (!trajectory.length) return []

    if (trajectory.length <= ROUTE_PREVIEW_LIMIT) {
      return trajectory
    }

    const preview: Position[] = []
    const interval = Math.ceil(trajectory.length / ROUTE_PREVIEW_LIMIT)
    for (let index = 0; index < trajectory.length; index += interval) {
      const point = trajectory[index]
      if (point) {
        preview.push(point)
      }
    }

    const lastPoint = trajectory[trajectory.length - 1]
    const previewLastPoint = preview[preview.length - 1]
    if (lastPoint && (!previewLastPoint || previewLastPoint.x !== lastPoint.x || previewLastPoint.y !== lastPoint.y)) {
      preview.push(lastPoint)
    }

    return preview
  })

  const chargingStationPosition = computed<Position | null>(() => {
    const station = environmentInfo.value?.charging_station
    if (!station) return null
    return { x: station.x, y: station.y }
  })

  const countVisitedTiles = (grid: number[][]): number => {
    if (!grid?.length) return 0
    return grid.reduce((total, row) => {
      return (
        total +
        row.reduce((rowCount, cell) => {
          return rowCount + (cell > 0 ? 1 : 0)
        }, 0)
      )
    }, 0)
  }

  const routeStats = computed<TemplateAgentRouteStats>(() => {
    const info = environmentInfo.value
    if (!info) {
      return {
        visitedTiles: 0,
        totalTiles: 0,
        visitedRatio: 0,
        stepCount: playbackFrames.value.length,
        pathLength: robotTrajectory.value.length,
        start: null,
        end: null,
      }
    }

    const totalTiles = info.width * info.height
    const visitedTiles = countVisitedTiles(coverageMap.value)
    const start = robotTrajectory.value[0] ?? null
    const end = robotTrajectory.value[robotTrajectory.value.length - 1] ?? null

    return {
      visitedTiles,
      totalTiles,
      visitedRatio: totalTiles ? (visitedTiles / totalTiles) * 100 : 0,
      stepCount: playbackFrames.value.length,
      pathLength: robotTrajectory.value.length,
      start,
      end,
    }
  })

  const environmentVisualizationProps = computed<TemplateAgentEnvironmentVisualizationProps | null>(() => {
    const info = environmentInfo.value
    if (!info) return null

    return {
      gridWidth: info.width,
      gridHeight: info.height,
      threatGrid: threatGrid.value,
      coverageMap: coverageMap.value,
      robotPosition: robotPosition.value,
      robotOrientation: robotOrientation.value,
      trajectory: robotTrajectory.value,
      chargingStationPosition: chargingStationPosition.value,
    }
  })

  const suspiciousObjects = computed(() => environmentInfo.value?.suspicious_objects ?? [])

  return {
    environmentInfo,
    playbackFrames,
    latestFrame,
    coverageMap,
    threatGrid,
    robotPosition,
    robotOrientation,
    robotTrajectory,
    routeWaypoints,
    routeStats,
    environmentVisualizationProps,
    suspiciousObjects,
  }
}
