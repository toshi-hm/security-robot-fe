import type { Position } from '~/libs/domains/common/Position'

// RobotState interface might be needed depending on imports.
// Ideally we should import it, but let's define a local compatible interface or use 'any' if types are circular.
// Based on EnvironmentVisualization.vue, we can see the shape.
export interface RobotRenderState {
  x: number
  y: number
  orientation: number | null
  id: number
  battery: number
  isCharging: boolean
}

export interface EnvironmentRenderProps {
  gridWidth: number
  gridHeight: number
  robots: RobotRenderState[]
  coverageMap: number[][] | boolean[][]
  threatGrid: number[][]
  visitHistoryMap?: number[][] // Cycle 11: Pheromone/Visit History Map
  obstacles: boolean[][] | null
  trajectories: Record<number, Position[]>
  patrolRadius: number
  chargingStations: Position[]
}

interface TrajectoryColors {
  line: string
  point: string
  pointBorder: string
}

export const useCanvasRenderer = () => {
  const cellSize = 60 // pixels per cell

  /**
   * Get color for threat level (heatmap)
   * @param level - Threat level 0.0 to 1.0
   */
  const getThreatColor = (level: number): string => {
    if (level === 0) return 'var(--color-bg-no-threat)'

    const red = Math.floor(255)
    const green = Math.floor(255 * (1 - level))
    const blue = 0

    return `rgb(${red}, ${green}, ${blue})`
  }

  const normalizeOrientation = (orientation: number | null | undefined): number | null => {
    if (typeof orientation !== 'number' || Number.isNaN(orientation)) return null
    const normalized = Math.round(orientation) % 4
    return normalized < 0 ? normalized + 4 : normalized
  }

  const robotColors = [
    '#409eff', // Blue (Default)
    '#67c23a', // Green
    '#e6a23c', // Orange
    '#f56c6c', // Red
    '#909399', // Gray
    '#a0cfff', // Light Blue
    '#b3e19d', // Light Green
    '#f3d19e', // Light Orange
  ]

  const getRobotColor = (index: number): string => {
    return robotColors[index % robotColors.length] ?? '#409EFF'
  }

  const drawChargingStation = (ctx: CanvasRenderingContext2D, stationX: number, stationY: number) => {
    const size = cellSize * 0.7

    // Draw background circle (green)
    ctx.fillStyle = '#67c23a'
    ctx.beginPath()
    ctx.arc(stationX, stationY, size / 2, 0, Math.PI * 2)
    ctx.fill()

    // Draw border
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 3
    ctx.stroke()

    // Draw lightning bolt symbol
    ctx.fillStyle = '#fff'
    ctx.font = `bold ${size * 0.6}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('⚡', stationX, stationY)
  }

  const drawPatrolRange = (
    ctx: CanvasRenderingContext2D,
    robotX: number,
    robotY: number,
    radiusCells: number,
    fillColor: string,
    strokeColor: string
  ) => {
    if (!radiusCells || radiusCells <= 0) return

    const radius = radiusCells * cellSize
    ctx.save()
    ctx.lineWidth = 2
    ctx.fillStyle = fillColor
    ctx.beginPath()
    ctx.arc(robotX, robotY, radius, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = strokeColor
    if (typeof ctx.setLineDash === 'function') {
      ctx.setLineDash([8, 6])
    }
    ctx.beginPath()
    ctx.arc(robotX, robotY, radius, 0, Math.PI * 2)
    ctx.stroke()
    if (typeof ctx.setLineDash === 'function') {
      ctx.setLineDash([])
    }
    ctx.restore()
  }

  const drawOrientationIndicator = (
    ctx: CanvasRenderingContext2D,
    robotX: number,
    robotY: number,
    color: string,
    orientationValue: number | null
  ) => {
    const orientation = normalizeOrientation(orientationValue)
    if (orientation === null) {
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(robotX, robotY - cellSize / 6, cellSize / 10, 0, Math.PI * 2)
      ctx.fill()
      return
    }

    const vectors: Array<{ dx: number; dy: number }> = [
      { dx: 0, dy: -1 }, // North
      { dx: 1, dy: 0 }, // East
      { dx: 0, dy: 1 }, // South
      { dx: -1, dy: 0 }, // West
    ]
    const vector = vectors[orientation]!
    const { dx, dy } = vector
    const arrowLength = cellSize * 0.45
    const startX = robotX
    const startY = robotY
    const endX = startX + dx * arrowLength
    const endY = startY + dy * arrowLength

    ctx.strokeStyle = color
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(startX, startY)
    ctx.lineTo(endX, endY)
    ctx.stroke()

    // Arrow head
    const headLength = 10
    const angle = Math.atan2(dy, dx)
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(endX, endY)
    ctx.lineTo(endX - headLength * Math.cos(angle - Math.PI / 6), endY - headLength * Math.sin(angle - Math.PI / 6))
    ctx.lineTo(endX - headLength * Math.cos(angle + Math.PI / 6), endY - headLength * Math.sin(angle + Math.PI / 6))
    ctx.closePath()
    ctx.fill()
  }

  const drawTrajectory = (
    ctx: CanvasRenderingContext2D,
    path: Position[],
    color: string | TrajectoryColors,
    defaultPointBorder: string = '#fff'
  ) => {
    if (!path || path.length === 0) return

    let specificColors: TrajectoryColors
    if (typeof color === 'string') {
      specificColors = {
        line: color,
        point: color,
        pointBorder: defaultPointBorder,
      }
    } else {
      specificColors = color
    }

    const { line: lineColor, point: pointColor, pointBorder } = specificColors

    // Stroke style handling
    // Simplified as original logic returned lineColor in both branches
    const strokeStyle = lineColor

    ctx.save()
    ctx.globalAlpha = 0.6

    ctx.strokeStyle = strokeStyle
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    ctx.beginPath()
    path.forEach((pos, index) => {
      const x = Math.floor(pos.x) * cellSize + cellSize / 2
      const y = Math.floor(pos.y) * cellSize + cellSize / 2

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

    ctx.globalAlpha = 1.0

    // Draw points
    path.forEach((pos, index) => {
      const x = Math.floor(pos.x) * cellSize + cellSize / 2
      const y = Math.floor(pos.y) * cellSize + cellSize / 2

      const opacity = 0.2 + (index / path.length) * 0.6

      ctx.save()
      ctx.globalAlpha = Math.min(1, Math.max(0, opacity))

      ctx.fillStyle = pointColor
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = pointBorder
      ctx.lineWidth = 1
      ctx.stroke()

      ctx.restore()
    })

    ctx.restore()
  }

  const drawEnvironment = (
    canvas: HTMLCanvasElement,
    data: EnvironmentRenderProps,
    transform: { offsetX: number; offsetY: number; scale: number }
  ) => {
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { offsetX, offsetY, scale } = transform
    const {
      gridWidth,
      gridHeight,
      obstacles,
      threatGrid,
      coverageMap,
      visitHistoryMap,
      chargingStations,
      robots,
      trajectories,
      patrolRadius,
    } = data

    // Dimensions
    const canvasWidth = gridWidth * cellSize
    const canvasHeight = gridHeight * cellSize

    // Read styles from CSS variables if possible, but here we might need to rely on passed styles or defaults
    // Since we are in a composable, accessing document.documentElement is fine strictly speaking if running in client.
    // However, it's expensive to call getComputedStyle every frame.
    // Let's assume critical colors are fetched/cached or we use defaults.
    // We will do a quick fetch here as in the original component, but ideally this should be cached outside the loop.
    const rootStyle = getComputedStyle(document.documentElement)
    const visitedCellColor = rootStyle.getPropertyValue('--color-bg-visited-cell').trim() || 'rgba(0, 255, 0, 0.2)'
    const gridBorderColor = rootStyle.getPropertyValue('--color-border-grid').trim() || '#999'
    const robotBorderColor = rootStyle.getPropertyValue('--color-robot-border').trim() || '#fff'
    const robotDirectionColor = rootStyle.getPropertyValue('--color-robot-direction-indicator').trim() || '#fff'
    const patrolRangeFillColor =
      rootStyle.getPropertyValue('--color-patrol-range-fill').trim() || 'rgba(64, 158, 255, 0.12)'
    const patrolRangeStrokeColor =
      rootStyle.getPropertyValue('--color-patrol-range-stroke').trim() || 'rgba(64, 158, 255, 0.65)'
    const defaultTrajectoryPointBorder =
      rootStyle.getPropertyValue('--color-trajectory-point-border').trim() || 'rgb(255 255 255)'

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)

    ctx.save()
    ctx.translate(offsetX, offsetY)
    ctx.scale(scale, scale)

    // Draw grid cells
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        const cellX = x * cellSize
        const cellY = y * cellSize
        const isObstacle = obstacles?.[y]?.[x] ?? false

        if (isObstacle) {
          ctx.fillStyle = '#2c3e50'
          ctx.fillRect(cellX, cellY, cellSize, cellSize)
        } else {
          const threatLevel = threatGrid?.[y]?.[x] ?? 0
          const heatColor = getThreatColor(threatLevel)
          ctx.fillStyle = heatColor
          ctx.fillRect(cellX, cellY, cellSize, cellSize)

          const cellValue = coverageMap?.[y]?.[x]
          const isVisited = typeof cellValue === 'number' ? cellValue > 0 : Boolean(cellValue)

          // Cycle 11: Prefer Visit History Map (Pheromone) if available
          const visitValue = visitHistoryMap?.[y]?.[x]
          if (typeof visitValue === 'number' && visitValue > 0) {
            // Blue-ish overlay for Visit History (Pheromone)
            // Opacity based on value (1.0 = Recent = Strong, 0.0 = Old = Weak)
            const opacity = Math.min(0.6, visitValue * 0.6)
            ctx.fillStyle = `rgba(0, 120, 255, ${opacity})`
            ctx.fillRect(cellX, cellY, cellSize, cellSize)
          } else if (isVisited) {
            // Fallback to legacy Coverage Map
            ctx.fillStyle = visitedCellColor
            ctx.fillRect(cellX, cellY, cellSize, cellSize)
          }
        }

        ctx.strokeStyle = gridBorderColor
        ctx.lineWidth = 1
        ctx.strokeRect(cellX, cellY, cellSize, cellSize)
      }
    }

    // Charging stations
    chargingStations.forEach((pos) => {
      const stationX = Math.floor(pos.x) * cellSize + cellSize / 2
      const stationY = Math.floor(pos.y) * cellSize + cellSize / 2
      drawChargingStation(ctx, stationX, stationY)
    })

    // Trajectories
    // Note: Colors handling needed.
    // We can iterate data.trajectories
    if (trajectories) {
      Object.entries(trajectories).forEach(([robotIdStr, path]) => {
        const robotId = Number(robotIdStr)
        const robotIndex = robots.findIndex((r) => r.id === robotId)
        const colorIndex = robotIndex >= 0 ? robotIndex : robotId
        const color = getRobotColor(colorIndex)
        // Note: original code merged legacy trajectory logic. Assume data is normalized before calling draw.
        drawTrajectory(ctx, path, color, defaultTrajectoryPointBorder)
      })
    }

    // Robots
    robots.forEach((robot, index) => {
      const robotX = Math.floor(robot.x) * cellSize + cellSize / 2
      const robotY = Math.floor(robot.y) * cellSize + cellSize / 2
      const robotColor = getRobotColor(index)

      // Patrol range (first robot only as per original logic)
      if (index === 0) {
        drawPatrolRange(ctx, robotX, robotY, patrolRadius, patrolRangeFillColor, patrolRangeStrokeColor)
      }

      // Body
      ctx.fillStyle = robotColor
      ctx.beginPath()
      ctx.arc(robotX, robotY, cellSize / 3, 0, Math.PI * 2)
      ctx.fill()

      // Border
      ctx.strokeStyle = robotBorderColor
      ctx.lineWidth = 3
      ctx.stroke()

      // Charging indicator
      if (robot.isCharging) {
        ctx.strokeStyle = '#E6A23C'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(robotX, robotY, cellSize / 2.5, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Direction
      drawOrientationIndicator(ctx, robotX, robotY, robotDirectionColor, robot.orientation)

      // ID Badge
      if (robots.length > 1 && typeof robot.id === 'number') {
        ctx.fillStyle = '#fff'
        ctx.font = `bold ${cellSize / 4}px Arial`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(String(robot.id), robotX, robotY)
      }
    })

    ctx.restore()
  }

  return {
    drawEnvironment,
    getRobotColor,
    getThreatColor,
    drawTrajectory,
    drawPatrolRange,
    drawOrientationIndicator,
    drawChargingStation,
    cellSize,
  }
}
