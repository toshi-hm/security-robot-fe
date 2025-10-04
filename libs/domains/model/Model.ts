export interface ModelSummary {
  id: string
  name: string
  algorithm: 'ppo' | 'a3c'
  createdAt: string
  bestReward: number
}
