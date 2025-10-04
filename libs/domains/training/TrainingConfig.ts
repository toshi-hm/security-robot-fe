export interface TrainingConfig {
  environmentId: string
  totalTimesteps: number
  learningRate: number
  gamma: number
  seed?: number
}
