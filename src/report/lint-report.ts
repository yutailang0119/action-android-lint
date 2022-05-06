import * as core from '@actions/core'
import {LintIssue} from '../lint-issue'
import {Align, link, table} from '../utils/markdown_utils'

const MAX_REPORT_LENGTH = 65535

export function buildLintReportMarkdown(lintIssues: LintIssue[]): string {
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

  const badges = getLintReportBadges(lintIssues)
  sections.push(...badges)

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
      sections.push(idTables.join('\n'))
    }
  } else {
    sections.push('Congratulations! No lint issues found!')
  }
  return sections
}

function getHeaderLink(text: string, header: string): string {
  return link(text, `#${header.replace(/\s+/g, '-')}`)
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
  // const hint = errors > 0 || fatalities > 0 ? 'Lint errors found' : 'Lint scan successful'
  let uri = ''
  if (informational > 0) {
    uri = encodeURIComponent(`Informational-${informational}-${infoColor}`)
    badges.push(`\`![Informational lint issues](https://img.shields.io/badge/${uri})\``)
  }
  if (warnings > 0) {
    uri = encodeURIComponent(`Warnings-${warnings}-${warningColor}`)
    badges.push(`\`![Warning lint issues](https://img.shields.io/badge/${uri})\``)
  }
  if (errors > 0) {
    uri = encodeURIComponent(`Errors-${errors}-${errorColor}`)
    badges.push(`\`![Error lint issues](https://img.shields.io/badge/${uri})\``)
  }
  if (fatalities > 0) {
    uri = encodeURIComponent(`Fatal-${fatalities}-${fatalColor}`)
    badges.push(`\`![Fatal lint issues](https://img.shields.io/badge/${uri})\``)
  }

  return badges
}

function getByteLength(text: string): number {
  return Buffer.byteLength(text, 'utf8')
}
