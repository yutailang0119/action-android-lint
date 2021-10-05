import * as core from '@actions/core'
import {Annotation} from './annotation'

export const echoMessages = (annotations: Annotation[]): void => {
  for (const annotation of annotations) {
    if (annotation.severityLevel === 'error') {
      core.error(annotation.message, annotation.properties)
    } else {
      core.warning(annotation.message, annotation.properties)
    }
  }
}
