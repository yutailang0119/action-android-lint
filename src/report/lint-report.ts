import * as core from '@actions/core'
import {LintIssue} from '../lint-issue'
import {Align, link, table} from '../utils/markdown_utils'

const MAX_REPORT_LENGTH = 65535

export function getLintReport(lintIssues: LintIssue[]): string {
  core.info('Generating lint analysis summary')

  const lines = renderLintReport(lintIssues)
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

function renderLintReport(lintIssues: LintIssue[]): string[] {
  const sections: string[] = []

  sections.push('# Android Lint Results\n\n')

  const badge = getLintReportBadge(lintIssues)
  sections.push(badge)

  const issues = getLintIssuesReport(lintIssues)
  sections.push(...issues)

  return sections
}

function getLintIssuesReport(lintIssues: LintIssue[]): string[] {
  const sections: string[] = []

  sections.push('## Summary\n\n')

  if (lintIssues.length > 1) {
    const categories = [...new Set(lintIssues.map(li => li.category))]
    const idTables: string[] = []
    for (const cat of categories) {
      sections.push(`### ${cat}`)
      const categoryData = lintIssues.filter(li => li.category === cat)
      const ids = [...new Set(categoryData.map(li => li.id))]
      const categorySummaryRows: string[][] = []
      for (const id of ids) {
        const idData = categoryData.find(cd => cd.id === id)
        const idRows = categoryData.filter(cd => cd.id === id)
        const count = idRows.length
        if (count > 0 && idRows && idData) {
          categorySummaryRows.push([
            count.toString(),
            getHeaderLink(id, idData.summary),
            idData.summary
          ])
          idTables.push(`## ${idData.summary}`)
          idTables.push(`### Explanation`)
          idTables.push(`${idData.explanation}`)
          if (idData.url && idData.urls) {
            idTables.push(`More Info: ${link(idData.url, idData.urls)}`)
          }
          for (const idI of idRows) {
            idTables.push('---')
            idTables.push(`${idI.file}:${idI.line}:${idI.message}`)
            if (idI.errorLine1) {
              idTables.push('```java')
              idTables.push(`${idI.errorLine1}`)
              if (idI.errorLine2) {
                idTables.push(`${idI.errorLine2}`)
              }
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
      sections.push(idTables.join('\n'))
    }
  } else {
    sections.push('Congratulations! No lint issues found!')
  }
  return sections
}

function getHeaderLink(text: string, header: string): string {
  return link(text, `#${header.replace(' ', '-')}`)
}

function getLintReportBadge(lintIssues: LintIssue[]): string {
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
  return getBadge(informational, warnings, errors, fatals)
}

function getBadge(
  informational: number,
  warnings: number,
  errors: number,
  fatalities: number
): string {
  const text = []
  if (informational > 0) {
    text.push(`${informational} informational issues`)
  }
  if (warnings > 0) {
    text.push(`${warnings} warnings`)
  }
  if (errors > 0) {
    text.push(`${errors} errors`)
  }
  if (fatalities > 0) {
    text.push(`${fatalities} fatal issues`)
  }
  const message = text.length > 0 ? text.join(', ') : 'none'

  let color = 'success'
  if (errors > 0 || fatalities > 0) {
    color = 'critical'
  } else if (warnings > 0) {
    color = 'yellow'
  }
  const hint =
    errors > 0 || fatalities > 0 ? 'Lint errors found' : 'Lint scan successful'
  const uri = encodeURIComponent(`LintResults-${message}-${color}`)
  return `![${hint}](https://img.shields.io/badge/${uri})`
}

function getByteLength(text: string): number {
  return Buffer.byteLength(text, 'utf8')
}
