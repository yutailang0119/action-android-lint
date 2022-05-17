import {LintIssue} from '../lint-issue'
import * as core from '@actions/core'
import * as github from '@actions/github'
import {buildLintReportMarkdown} from './lint-report'

export async function buildJobSummary(lintIssues: LintIssue[]): Promise<void> {
  core.info('Creating job summary for Android Lint results')
  const baseUrl = getBaseUrl()
  core.info(`BaseUrl: ${baseUrl}`)

  const summary = core.summary.addHeading('Android Lint Results').addBreak()
  const badges = getLintReportBadges(lintIssues)
  for (const badge of badges) {
    summary.addImage(badge.location, badge.hintText)
  }
  if (lintIssues.length > 1) {
    // TODO - Perhaps someday, use the built-in markdown helpers in core.summary,
    // TODO - but a first attempt proved to be fruitless
    summary.addRaw(buildLintReportMarkdown(lintIssues, baseUrl), true)
  } else {
    summary.addRaw('Congratulations! No lint issues found!')
  }
  await summary.write()
}

function getBaseUrl(): string {
  const runId = github.context.runId
  const repo = github.context.repo
  return `https://github.com/${repo.owner}/${repo.repo}/actions/runs/${runId}`
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
