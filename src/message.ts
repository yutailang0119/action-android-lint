export class Message {
  severity: Severity
  path: string
  line: number
  column: number
  description: string

  constructor(
    severity: string,
    path: string,
    line: number,
    column: number,
    description: string
  ) {
    this.severity = severity === 'Warning' ? Severity.Warning : Severity.Error
    this.path = path
    this.line = line
    this.column = column
    this.description = description
  }
}

enum Severity {
  Warning = 'warning',
  Error = 'error'
}
