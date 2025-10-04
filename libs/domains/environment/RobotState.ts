export interface RobotState {
  position: { row: number; col: number }
  batteryLevel: number
  sensorReadings: number[]
}
