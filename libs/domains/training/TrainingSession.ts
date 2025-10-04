export interface TrainingSession {
  id: string
  name: string
  algorithm: 'ppo' | 'a3c'
  status: 'pending' | 'running' | 'completed' | 'failed'
  createdAt: string
  updatedAt: string
}
