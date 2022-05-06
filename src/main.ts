import * as core from '@actions/core'
import * as glob from '@actions/glob'
import * as github from '@actions/github'
// import {echoMessages} from './command'
import {parseLintXmls /*, parseXmls*/} from './parser'
import {GitHub} from '@actions/github/lib/utils'
// import {getCheckRunContext} from './utils/github-utils'
import {EventPayloads} from '@octokit/webhooks'
import { getLintReport } from "./report/lint-report";

async function main(): Promise<void> {
  try {
    const lintReporter = new LintReporter()
    await lintReporter.run()
  } catch (error) {
    core.setFailed(error.message)
  }
}

class LintReporter {
  readonly token = core.getInput('token', {required: true})
  readonly octokit: InstanceType<typeof GitHub>
  readonly context = this.getCheckRunContext()

  constructor() {
    this.octokit = github.getOctokit(this.token)
  }

  async run(): Promise<void> {
    try {
      const reportPath = core.getInput('report-path', {required: true})
      const globOptions = {
        followSymbolicLinks: core.getBooleanInput('follow-symbolic-links')
      }
      const globber = await glob.create(reportPath, globOptions)
      const files = await globber.glob()

      const name = 'ThisIsAName'

      core.info(`Creating check run: ${name}`)

      const createResp = await this.octokit.checks.create({
        head_sha: this.context.sha,
        name,
        status: 'in_progress',
        output: {
          title: name,
          summary: ''
        },
        ...github.context.repo
      })

      // const annotations = await parseXmls(files)
      const lintIssues = await parseLintXmls(files)
      const summary = getLintReport(lintIssues)
      const conclusion = 'success'

      core.info(`Updating check run: ${name}`)

      const resp = await this.octokit.checks.update({
        check_run_id: createResp.data.id,
        conclusion,
        status: 'completed',
        output: {
          title: `Some title, yo`,
          summary,
          annotations: null
        },
        ...github.context.repo
      })

      core.info(`Check run create response: ${resp.status}`)
      core.info(`Check run URL: ${resp.data.url}`)
      core.info(`Check run HTML: ${resp.data.html_url}`)

      // echoMessages(annotations)
      //
      // const errors = annotations.filter(annotation => {
      //   return annotation.severityLevel === 'error'
      // })
      // if (errors.length) {
      //   const unit = errors.length === 1 ? 'error' : 'errors'
      //   throw Error(`Android Lint with ${errors.length} ${unit}`)
      // }
    } catch (error) {
      if (error instanceof Error) core.setFailed(error.message)
    }
  }

  getCheckRunContext(): {sha: string; runId: number} {
    if (github.context.eventName === 'workflow_run') {
      core.info(
        'Action was triggered by workflow_run: using SHA and RUN_ID from triggering workflow'
      )
      const event = github.context
        .payload as EventPayloads.WebhookPayloadWorkflowRun
      if (!event.workflow_run) {
        throw new Error(
          "Event of type 'workflow_run' is missing 'workflow_run' field"
        )
      }
      return {
        sha: event.workflow_run.head_commit.id,
        runId: event.workflow_run.id
      }
    }

    const runId = github.context.runId
    if (github.context.payload.pull_request) {
      core.info(
        `Action was triggered by ${github.context.eventName}: using SHA from head of source branch`
      )
      const pr = github.context.payload
        .pull_request as EventPayloads.WebhookPayloadPullRequestPullRequest
      return {sha: pr.head.sha, runId}
    }

    return {sha: github.context.sha, runId}
  }
}

main()
