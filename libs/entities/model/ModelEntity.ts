export interface ModelEntity {
  id: number
  filename: string
  original_filename: string
  file_path: string
  file_size: number
  file_type: string
  content_type: string
  training_job_id: number | null
  description: string | null
  metadata: Record<string, any> | null
  created_at: string
  updated_at: string
}
