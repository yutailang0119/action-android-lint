export interface LintIssue {
  id: string
  severity: string
  message: string
  category: string
  priority: number
  summary: string
  explanation: string
  url: string | undefined
  urls: string | undefined
  errorLine1: string
  errorLine2: string
  file: string
  line: number
  column: number
}
