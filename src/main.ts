import * as core from '@actions/core'
// import * as glob from '@actions/glob'
import * as github from '@actions/github'
import {parseLintXmls /*, parseXmls*/} from './parser'
import {GitHub} from '@actions/github/lib/utils'
import {getCheckRunContext} from './utils/github-utils'
import {buildLintReportMarkdown} from './report/lint-report'
import {normalizeFilePath} from './utils/path-utils'
import {ArtifactProvider} from './input-providers/artifact-provider'
import {LocalFileProvider} from './input-providers/local-file-provider'
import {LintIssue} from './lint-issue'

async function main(): Promise<void> {
  try {
    const lintReporter = new LintReporter()
    await lintReporter.run()
  } catch (error) {
    core.setFailed((error as Error).message)
  }
}

class LintReporter {
  readonly artifact = core.getInput('artifact', {required: false})
  readonly name = core.getInput('name', {required: true})
  readonly pathReplaceBackslashes =
    core.getInput('path-replace-backslashes', {required: false}) === 'true'
  readonly token = core.getInput('token', {required: true})
  readonly runName = core.getInput('name', {required: true})
  readonly reportPath = core.getInput('report-path', {required: true})
  readonly globOptions = {
    followSymbolicLinks: core.getBooleanInput('follow-symbolic-links')
  }
  readonly octokit: InstanceType<typeof GitHub>
  readonly context = getCheckRunContext()

  constructor() {
    this.octokit = github.getOctokit(this.token)
  }

  async run(): Promise<void> {
    try {
      // const globber = await glob.create(this.reportPath, this.globOptions)
      // const files = await globber.glob()

      core.info(`Creating check run: ${this.runName}`)

      const createResp = await this.octokit.checks.create({
        head_sha: this.context.sha,
        name: this.runName,
        status: 'in_progress',
        output: {
          title: this.runName,
          summary: ''
        },
        ...github.context.repo
      })

      const pathList = this.reportPath.split(',')
      const pattern = this.pathReplaceBackslashes
        ? pathList.map(normalizeFilePath)
        : pathList

      const inputProvider = this.artifact
        ? new ArtifactProvider(
            this.octokit,
            this.artifact,
            this.name,
            pattern,
            this.context.sha,
            this.context.runId,
            this.token
          )
        : new LocalFileProvider(this.name, pattern)

      // const trackedFiles = await inputProvider.listTrackedFiles()
      // const lintIssues = await parseLintXmls(files)
      const lintIssues: LintIssue[] = []
      const input = await inputProvider.load()
      for (const theFiles of Object.entries(input)) {
        const li = await parseLintXmls(theFiles)
        lintIssues.push(...li)
      }
      const summary = buildLintReportMarkdown(
        lintIssues,
        createResp.data.html_url ?? ''
      )
      const conclusion = 'success'

      const resp = await this.octokit.checks.update({
        check_run_id: createResp.data.id,
        conclusion,
        status: 'completed',
        output: {
          title: '',
          summary,
          annotations: []
        },
        ...github.context.repo
      })

      core.info(`Check run create response: ${resp.status}`)
      core.info(`Check run URL: ${resp.data.url}`)
      core.info(`Check run HTML: ${resp.data.html_url}`)
    } catch (error) {
      if (error instanceof Error) core.setFailed(error.message)
    }
  }

  // getCheckRunContext(): {sha: string; runId: number} {
  //   if (github.context.eventName === 'workflow_run') {
  //     core.info(
  //       'Action was triggered by workflow_run: using SHA and RUN_ID from triggering workflow'
  //     )
  //     const event = github.context
  //       .payload as EventPayloads.WebhookPayloadWorkflowRun
  //     if (!event.workflow_run) {
  //       throw new Error(
  //         "Event of type 'workflow_run' is missing 'workflow_run' field"
  //       )
  //     }
  //     return {
  //       sha: event.workflow_run.head_commit.id,
  //       runId: event.workflow_run.id
  //     }
  //   }
  //
  //   const runId = github.context.runId
  //   if (github.context.payload.pull_request) {
  //     core.info(
  //       `Action was triggered by ${github.context.eventName}: using SHA from head of source branch`
  //     )
  //     const pr = github.context.payload
  //       .pull_request as EventPayloads.WebhookPayloadPullRequestPullRequest
  //     return {sha: pr.head.sha, runId}
  //   }
  //
  //   return {sha: github.context.sha, runId}
  // }
}

main()
