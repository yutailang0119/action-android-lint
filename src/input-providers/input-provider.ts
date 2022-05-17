export interface ReportInput {
  [reportName: string]: FileContent[]
}

export interface FileContent {
  file: string
  content: string
}

export interface InputProvider {
  load(): Promise<string[]>
  listTrackedFiles(): Promise<string[]>
}
