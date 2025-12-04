export interface RobotState {
  id: number
  x: number
  y: number
  orientation: number
  batteryPercentage: number
  isCharging: boolean
  actionTaken?: number
}
