import * as command from '@actions/core/lib/command'
import {Annotation} from './annotation'

const commandProperties = (annotation: Annotation): {[key: string]: string} => {
  return {
    file: annotation.path,
    line: `${annotation.line}`,
    col: `${annotation.column}`
  }
}

export async function echoMessages(annotations: Annotation[]): Promise<void> {
  for (const annotation of annotations) {
    command.issueCommand(
      annotation.level,
      commandProperties(annotation),
      annotation.message
    )
  }
}
