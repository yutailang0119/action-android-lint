import fs from 'fs'
import * as core from '@actions/core'
import * as xml2js from 'xml2js'
import {LintIssue} from './lint-issue'

export const parseLintXmls = async (files: string[]): Promise<LintIssue[]> => {
  const list = await Promise.all(
    files.map(async file => {
      const xml = fs.readFileSync(file, 'utf-8')
      return await parseLintXml(xml)
    })
  )
  return list.flat()
}

export const parseLintXml = async (text: string): Promise<LintIssue[]> => {
  const parser = new xml2js.Parser()
  const xml = await parser.parseStringPromise(text)
  return new Promise(resolve => {
    try {
      const lintIssues: LintIssue[] = []
      if (xml.issues.issue) {
        for (const issueElement of xml.issues.issue) {
          const issue = issueElement.$

          for (const locationElement of issueElement.location) {
            const location = locationElement.$

            const lintIssue: LintIssue = {
              id: issue.id,
              severity: issue.severity,
              message: issue.message,
              category: issue.category,
              priority: parseInt(issue.priority),
              summary: issue.summary,
              explanation: issue.explanation,
              errorLine1: issue.errorLine1,
              errorLine2: issue.errorLine2,
              url: issue.url ?? undefined,
              urls: issue.urls ?? undefined,
              file: location.file,
              line: parseInt(location.line),
              column: parseInt(location.column)
            }
            lintIssues.push(lintIssue)
          }
        }
      }
      resolve(lintIssues)
    } catch (error) {
      core.debug(`failed to read ${error}`)
    }
  })
}
