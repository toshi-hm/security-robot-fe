/**
 * Position type definitions for environment coordinates
 *
 * This file provides unified coordinate system types to ensure consistency
 * across components and pages.
 */

/**
 * Cartesian coordinate position (x, y)
 * Used for robot position and trajectory in EnvironmentVisualization
 */
export interface Position {
  x: number
  y: number
}

/**
 * Grid position (row, col)
 * Used for grid-based components like RobotPositionDisplay
 * Note: row corresponds to Y-axis, col corresponds to X-axis
 */
export interface GridPosition {
  row: number
  col: number
}

/**
 * Convert Position to GridPosition
 * @param pos - Cartesian position
 * @returns Grid position
 */
export function positionToGridPosition(pos: Position): GridPosition {
  return {
    row: pos.y,
    col: pos.x,
  }
}

/**
 * Convert GridPosition to Position
 * @param gridPos - Grid position
 * @returns Cartesian position
 */
export function gridPositionToPosition(gridPos: GridPosition): Position {
  return {
    x: gridPos.col,
    y: gridPos.row,
  }
}
