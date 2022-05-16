import {LintIssue} from '../lint-issue'
import * as core from '@actions/core'
import {Align, link, table} from '../utils/markdown_utils'
import {slug} from '../utils/slugger'
import {SummaryTableRow, SummaryTableCell} from '@actions/core/lib/summary'

export async function buildJobSummary(lintIssues: LintIssue[]): Promise<void> {
  core.info('Creating job summary for Android Lint results')

  const summary = core.summary
    .addHeading('Android Lint Results')
    .addBreak()
    .addBreak()
  const badges = getLintReportBadges(lintIssues)
  summary.addRaw(badges.join('\n'))
  summary.addHeading('Summary', 2)
  summary.addBreak().addBreak()
  if (lintIssues.length > 1) {
    const categories = [...new Set(lintIssues.map(li => li.category))].map(
      (cat, catIndex) => {
        const category = cat
        const index = catIndex
        return {category, index}
      }
    )
    const idList: IdRow[] = []
    for (const cat of categories) {
      summary.addHeading(`${cat.category}`, 3)
      const categoryData = lintIssues.filter(li => li.category === cat.category)
      const ids = [...new Set(categoryData.map(li => li.id))].map(
        (li, idIndex) => {
          const issueId = li
          const index = idIndex
          return {issueId, index}
        }
      )
      const categorySummaryRows: string[][] = []
      for (const id of ids) {
        const idData = categoryData.find(cd => cd.id === id.issueId)
        const idRows = categoryData.filter(cd => cd.id === id.issueId)
        const count = idRows.length
        if (idData && idRows && count > 0) {
          const headerLink = link(idData.id, makeLintIssueSlug(idData.summary))
          categorySummaryRows.push([
            count.toString(),
            headerLink,
            idData.summary,
            `${getSeverityIcon(idData)}`
          ])
          idList.push({header: idData.summary, headerLevel: 2, contents: []})
          const contents: string[] = []
          contents.push(`${idData.explanation}`)
          if (idData.url && idData.urls) {
            contents.push(`More Info: ${link(idData.url, idData.urls)}`)
          }
          for (const idI of idRows) {
            contents.push('---')
            contents.push(`${idI.file}:${idI.line}: ${idI.message}`)
            if (idI.errorLine1) {
              contents.push('```')
              contents.push(`${idI.errorLine1}`)
              if (idI.errorLine2) {
                contents.push(`${idI.errorLine2}`)
              }
              contents.push('```')
            }
          }
          idList.push({header: 'Explanation', headerLevel: 3, contents})
        }
      }
      const array: SummaryTableRow[] = []
      array.push([
        {data: 'Count', header: true},
        {data: 'Id', header: true},
        {data: 'Summary', header: true},
        {data: 'Severity', header: true}
      ])
      for (const row of categorySummaryRows) {
        array.push(row)
      }
      summary.addTable(array)
    }
    for (const row of idList) {
      summary.addHeading(row.header, row.headerLevel)
      summary.addRaw(row.contents.join('\n'))
    }
  } else {
    summary.addRaw('Congratulations! No lint issues found!')
  }
  await summary.write()
}

interface IdRow {
  header: string
  headerLevel: number
  contents: string[]
}

function getSeverityIcon(lintIssue: LintIssue): string {
  switch (lintIssue.severity) {
    case 'Fatal':
      return ':rotating_light:'
    case 'Error':
      return ':bangbang:'
    case 'Warning':
      return ':warning:'
    default:
      return ':information_source:'
  }
}

function makeLintIssueSlug(summary: string): string {
  return slug(summary).link
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
    badges.push(
      `![Informational lint issues](https://img.shields.io/badge/${uri})`
    )
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
