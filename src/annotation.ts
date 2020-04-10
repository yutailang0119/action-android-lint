export class Annotation {
  path: string
  line: number
  column: number
  summary: string
  message: string

  constructor(
    path: string,
    line: number,
    column: number,
    summary: string,
    message: string
  ) {
    this.path = path
    this.line = line
    this.column = column
    this.summary = summary
    this.message = message
  }
}
