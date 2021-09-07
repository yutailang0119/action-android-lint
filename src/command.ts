import * as command from '@actions/core/lib/command'
import {Annotation} from './annotation'

const commandProperties = (annotation: Annotation): {[key: string]: string} => {
  return {
    file: annotation.file,
    line: `${annotation.line}`,
    col: `${annotation.column}`
  }
}

export const echoMessages = (annotations: Annotation[]): void => {
  for (const annotation of annotations) {
    command.issueCommand(
      annotation.severityLevel,
      commandProperties(annotation),
      annotation.message
    )
  }
}
