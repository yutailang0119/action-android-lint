import * as core from '@actions/core'
import {LintIssue} from '../lint-issue'
import {Align, link, table} from '../utils/markdown_utils'
import {slug} from '../utils/slugger'

const MAX_REPORT_LENGTH = 65535

export function buildLintReportMarkdown(lintIssues: LintIssue[], baseUrl: string): string {
  core.info('Generating lint analysis summary')

  const lines = renderLintReport(lintIssues, baseUrl)
  const report = lines.join('\n')

  if (getByteLength(report) <= MAX_REPORT_LENGTH) {
    return report
  }

  core.warning(
    `Lint report summary exceeded limit of ${MAX_REPORT_LENGTH} bytes and will be trimmed`
  )
  return trimReport(lines)
}

function trimReport(lines: string[]): string {
  const closingBlock = '```'
  const errorMsg = `**Report exceeded GitHub limit of ${MAX_REPORT_LENGTH} bytes and has been trimmed**`
  const maxErrorMsgLength = closingBlock.length + errorMsg.length + 2
  const maxReportLength = MAX_REPORT_LENGTH - maxErrorMsgLength

  let reportLength = 0
  let codeBlock = false
  let endLineIndex = 0
  for (endLineIndex = 0; endLineIndex < lines.length; endLineIndex++) {
    const line = lines[endLineIndex]
    const lineLength = getByteLength(line)

    reportLength += lineLength + 1
    if (reportLength > maxReportLength) {
      break
    }

    if (line === '```') {
      codeBlock = !codeBlock
    }
  }

  const reportLines = lines.slice(0, endLineIndex)
  if (codeBlock) {
    reportLines.push('```')
  }
  reportLines.push(errorMsg)
  return reportLines.join('\n')
}

function renderLintReport(lintIssues: LintIssue[], baseUrl: string): string[] {
  const sections: string[] = []

  sections.push('# Android Lint Results\n\n')

  const badges = getLintReportBadges(lintIssues)
  sections.push(...badges)

  const issues = getLintIssuesReport(lintIssues, baseUrl)
  sections.push(...issues)

  return sections
}

function getLintIssuesReport(lintIssues: LintIssue[], baseUrl: string): string[] {
  const sections: string[] = []

  sections.push('## Summary\n\n')

  if (lintIssues.length > 1) {
    const categories = [...new Set(lintIssues.map(li => li.category))].map((cat, catIndex) => {
        const category = cat
        const index = catIndex
        return {category, index}
    })
    const issueDetails: string[] = []
    for (const cat of categories) {
      const idTables: string[] = []
      sections.push(`### ${cat.category}`)
      const categoryData = lintIssues.filter(li => li.category === cat.category)
      const ids = [...new Set(categoryData.map(li => li.id))].map((li, idIndex) => {
          const issueId = li
          const index = idIndex
          return {issueId, index}
      })
      const categorySummaryRows: string[][] = []
      for (const id of ids) {
        const idData = categoryData.find(cd => cd.id === id.issueId)
        const idRows = categoryData.filter(cd => cd.id === id.issueId)
        const count = idRows.length
        if (idData && idRows && count > 0) {
          const lintSlug = makeLintIssueSlug(cat.index, id.index)
          const addr = baseUrl + lintSlug.link
          const headerLink = link(id.issueId, addr)
          categorySummaryRows.push([
            count.toString(),
            headerLink,
            idData.summary
          ])
          const nameLink = `<a id="${lintSlug.id}" href="${baseUrl + lintSlug.link}">${idData.summary}</a>`
          idTables.push(`## ${nameLink}`)
          idTables.push(`### Explanation`)
          idTables.push(`${idData.explanation}`)
          if (idData.url && idData.urls) {
            idTables.push(`More Info: ${link(idData.url, idData.urls)}`)
          }
          for (const idI of idRows) {
            idTables.push('---')
            idTables.push(`${idI.file}:${idI.line}: ${idI.message}`)
            if (idI.errorLine1) {
              idTables.push('```java')
              idTables.push(`${idI.errorLine1}`)
              if (idI.errorLine2) {
                idTables.push(`${idI.errorLine2}`)
              }
              idTables.push('```')
            }
          }
        }
      }
      const catTable = table(
        ['Count', 'Id', 'Summary'],
        [Align.Left, Align.Left, Align.Left],
        ...categorySummaryRows
      )

      sections.push(catTable)
      issueDetails.push(idTables.join('\n'))
    }
    sections.push(...issueDetails)
  } else {
    sections.push('Congratulations! No lint issues found!')
  }
  return sections
}

function makeLintIssueSlug(categoryIndex: number, idIndex: number): {id: string; link: string} {
  return slug(`c${categoryIndex}-${idIndex}`)
}

function getLintReportBadges(lintIssues: LintIssue[]): string[] {
  const informational = lintIssues.reduce(
    (sum, li) => sum + (li.severity === 'Information' ? 1 : 0),
    0
  )
  const warnings = lintIssues.reduce(
    (sum, li) => sum + (li.severity === 'Warning' ? 1 : 0),
    0
  )
  const errors = lintIssues.reduce(
    (sum, li) => sum + (li.severity === 'Error' ? 1 : 0),
    0
  )
  const fatals = lintIssues.reduce(
    (sum, li) => sum + (li.severity === 'Fatal' ? 1 : 0),
    0
  )
  return getBadges(informational, warnings, errors, fatals)
}

function getBadges(
  informational: number,
  warnings: number,
  errors: number,
  fatalities: number
): string[] {
  const badges = []
  const infoColor = 'informational'
  const warningColor = 'yellow'
  const errorColor = 'important'
  const fatalColor = 'critical'
  let uri = ''
  if (informational > 0) {
    uri = encodeURIComponent(`Informational-${informational}-${infoColor}`)
    badges.push(`![Informational lint issues](https://img.shields.io/badge/${uri})`)
  }
  if (warnings > 0) {
    uri = encodeURIComponent(`Warnings-${warnings}-${warningColor}`)
    badges.push(`![Warning lint issues](https://img.shields.io/badge/${uri})`)
  }
  if (errors > 0) {
    uri = encodeURIComponent(`Errors-${errors}-${errorColor}`)
    badges.push(`![Error lint issues](https://img.shields.io/badge/${uri})`)
  }
  if (fatalities > 0) {
    uri = encodeURIComponent(`Fatal-${fatalities}-${fatalColor}`)
    badges.push(`![Fatal lint issues](https://img.shields.io/badge/${uri})`)
  }

  return badges
}

function getByteLength(text: string): number {
  return Buffer.byteLength(text, 'utf8')
}
