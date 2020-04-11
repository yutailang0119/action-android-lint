import * as core from '@actions/core'
import {Annotation} from './annotation'

export const workflowMessage = (annotation: Annotation): string => {
  return `::${annotation.level} file=${annotation.path},line=${annotation.line},col=${annotation.column}::${annotation.message}`
}

export async function echoMessages(annotations: Annotation[]): Promise<void> {
  for (const annotation of annotations) {
    core.info(workflowMessage(annotation))
  }
}
