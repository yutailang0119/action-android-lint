import {AnnotationProperties} from '@actions/core'
import {AnnotationSeverityLevel} from './annotation-severity-level'

export class Annotation {
  severityLevel: AnnotationSeverityLevel
  properties: AnnotationProperties

  constructor(
    severity: string,
    public message: string,
    file: string,
    line: number,
    column: number
  ) {
    this.severityLevel = severity === 'Error' ? 'error' : 'warning'
    this.properties = {
      file,
      startLine: line,
      startColumn: column
    }
  }
}
