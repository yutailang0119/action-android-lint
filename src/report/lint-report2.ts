import {LintIssue} from '../lint-issue'
import * as core from '@actions/core'
import {slug} from '../utils/slugger'
import {SummaryTableRow} from '@actions/core/lib/summary'
import * as github from '@actions/github'

export async function buildJobSummary(lintIssues: LintIssue[]): Promise<void> {
  core.info('Creating job summary for Android Lint results')
  const baseUrl = getBaseUrl()
  core.info(`BaseUrl: ${baseUrl}`)

  const summary = core.summary.addHeading('Android Lint Results').addBreak()
  const badges = getLintReportBadges(lintIssues)
  for (const badge of badges) {
    summary.addImage(badge.location, badge.hintText)
  }
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
          const headerLink = wrap(
            'a',
            idData.id,
            baseUrl + makeLintIssueSlug(idData.summary)
          )
          categorySummaryRows.push([
            count.toString(),
            headerLink,
            idData.summary,
            `${getSeverityIcon(idData)}`
          ])
          idList.push({header: idData.summary, headerLevel: 2, contents: []})
          // Explanation
          idList.push({header: 'Explanation', headerLevel: 3, contents: []})
          idList.push({contents: [`${idData.explanation}`]})
          if (idData.url && idData.urls) {
            idList.push({contents: ['More Info: ']})
            idList.push({contents: {text: idData.url, address: idData.urls}})
          }
          // Code blocks
          for (const idI of idRows) {
            idList.push({contents: [`${idI.file}:${idI.line}: ${idI.message}`]})
            if (idI.errorLine1) {
              const block = []
              block.push(`${idI.errorLine1}`)
              if (idI.errorLine2) {
                block.push(`${idI.errorLine2}`)
              }
              idList.push({contents: {contents: block}})
            }
          }
        }
      }
      const array: SummaryTableRow[] = []
      array.push([
        {data: 'Count', header: true},
        {data: 'Id', header: true},
        {data: 'Summary', header: true},
        {data: 'Severity', header: true}
      ])
      array.push(...categorySummaryRows)
      summary.addTable(array)
    }
    summary.addSeparator()
    for (const row of idList) {
      if (row.header) {
        summary.addHeading(row.header, row.headerLevel)
      }
      if (row.contents instanceof CodeBlock) {
        summary.addCodeBlock(row.contents.contents.join('\n'))
      } else if (row.contents instanceof Link) {
        summary.addLink(row.contents.text, row.contents.address)
      } else {
        if (row.contents.length > 0) {
          summary.addRaw(row.contents.join('\n'))
        }
      }
    }
  } else {
    summary.addRaw('Congratulations! No lint issues found!')
  }
  await summary.write()
}

function wrap(tag: string, content: string, attrs = {}): string {
  const htmlAttrs = Object.entries(attrs)
    .map(([key, value]) => ` ${key}="${value}"`)
    .join('')
  if (!content) {
    return `<${tag}${htmlAttrs}>`
  }
  return `<${tag}${htmlAttrs}>${content}</${tag}>`
}

function getBaseUrl(): string {
  const runId = github.context.runId
  const repo = github.context.repo
  return `https://github.com/${repo}/actions/runs/${runId}`
}

interface IdRow {
  header?: string
  headerLevel?: number
  contents: string[] | CodeBlock | Link
}

class CodeBlock {
  contents: string[] = []
}

class Link {
  text = ''
  address = ''
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

interface Badge {
  hintText: string
  location: string
}

function getLintReportBadges(lintIssues: LintIssue[]): Badge[] {
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
): Badge[] {
  const badges: Badge[] = []
  const infoColor = 'informational'
  const warningColor = 'yellow'
  const errorColor = 'important'
  const fatalColor = 'critical'
  let uri = ''
  if (informational > 0) {
    uri = encodeURIComponent(`Informational-${informational}-${infoColor}`)
    badges.push({
      location: `https://img.shields.io/badge/${uri}`,
      hintText: 'Informational lint issues'
    })
  }
  if (warnings > 0) {
    uri = encodeURIComponent(`Warnings-${warnings}-${warningColor}`)
    badges.push({
      location: `https://img.shields.io/badge/${uri}`,
      hintText: 'Warning lint issues'
    })
  }
  if (errors > 0) {
    uri = encodeURIComponent(`Errors-${errors}-${errorColor}`)
    badges.push({
      location: `https://img.shields.io/badge/${uri}`,
      hintText: 'Error lint issues'
    })
  }
  if (fatalities > 0) {
    uri = encodeURIComponent(`Fatal-${fatalities}-${fatalColor}`)
    badges.push({
      location: `https://img.shields.io/badge/${uri}`,
      hintText: 'Fatal lint issues'
    })
  }

  return badges
}

// function getBadges(
//   informational: number,
//   warnings: number,
//   errors: number,
//   fatalities: number
// ): string[] {
//   const badges = []
//   const infoColor = 'informational'
//   const warningColor = 'yellow'
//   const errorColor = 'important'
//   const fatalColor = 'critical'
//   let uri = ''
//   if (informational > 0) {
//     uri = encodeURIComponent(`Informational-${informational}-${infoColor}`)
//     badges.push(
//       `![Informational lint issues](https://img.shields.io/badge/${uri})`
//     )
//   }
//   if (warnings > 0) {
//     uri = encodeURIComponent(`Warnings-${warnings}-${warningColor}`)
//     badges.push(`![Warning lint issues](https://img.shields.io/badge/${uri})`)
//   }
//   if (errors > 0) {
//     uri = encodeURIComponent(`Errors-${errors}-${errorColor}`)
//     badges.push(`![Error lint issues](https://img.shields.io/badge/${uri})`)
//   }
//   if (fatalities > 0) {
//     uri = encodeURIComponent(`Fatal-${fatalities}-${fatalColor}`)
//     badges.push(`![Fatal lint issues](https://img.shields.io/badge/${uri})`)
//   }
//
//   return badges
// }
