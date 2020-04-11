export class Annotation {
  level: AnnotationLevel
  path: string
  line: number
  column: number
  message: string

  constructor(
    level: string,
    path: string,
    line: number,
    column: number,
    message: string
  ) {
    this.level =
      level === 'Warning' ? AnnotationLevel.Warning : AnnotationLevel.Error
    this.path = path
    this.line = line
    this.column = column
    this.message = message
  }
}

enum AnnotationLevel {
  Warning = 'warning',
  Error = 'error'
}
