import {AnnotationProperties} from '@actions/core'
import {AnnotationSeverityLevel} from './annotation-severity-level'

export class Annotation {
  severityLevel: AnnotationSeverityLevel
  error: Error
  properties: AnnotationProperties

  constructor(
    severity: string,
    message: string,
    file: string,
    line: number,
    column: number
  ) {
    this.severityLevel = severity === 'Error' ? 'error' : 'warning'
    this.error = new Error(message)
    this.properties = {
      file,
      startLine: line,
      startColumn: column
    }
  }
}
