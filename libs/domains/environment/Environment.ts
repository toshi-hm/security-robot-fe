export interface EnvironmentDefinition {
  id: string
  name: string
  gridSize: { rows: number; cols: number }
  threatMap: number[][]
}
