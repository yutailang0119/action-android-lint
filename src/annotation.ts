import {AnnotationSeverityLevel} from './annotation-severity-level'

export class Annotation {
  severityLevel: AnnotationSeverityLevel
  path: string
  line: number
  column: number
  message: string

  constructor(
    severity: string,
    path: string,
    line: number,
    column: number,
    message: string
  ) {
    this.severityLevel = severity === 'Error' ? 'error' : 'warning'
    this.path = path
    this.line = line
    this.column = column
    this.message = message
  }
}
