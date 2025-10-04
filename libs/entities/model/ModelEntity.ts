import type { ModelSummary } from '../../domains/model/Model'
import type { ModelMetadata } from '../../domains/model/ModelMetadata'

export interface ModelEntity {
  summary: ModelSummary
  metadata: ModelMetadata
}
