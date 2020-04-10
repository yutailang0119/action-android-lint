export class Annotation {
  severity: Severity
  path: string
  line: number
  column: number
  summary: string
  message: string

  constructor(
    severity: string,
    path: string,
    line: number,
    column: number,
    summary: string,
    message: string
  ) {
    this.severity = severity === 'Warning' ? Severity.Warning : Severity.Error
    this.path = path
    this.line = line
    this.column = column
    this.summary = summary
    this.message = message
  }
}

enum Severity {
  Warning = 'warning',
  Error = 'error'
}
