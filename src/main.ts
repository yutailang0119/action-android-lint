import * as core from '@actions/core'
import * as glob from '@actions/glob'
import * as github from '@actions/github'
import {echoMessages} from './command'
import {parseLintXmls, parseXmls} from './parser'
import {GitHub} from '@actions/github/lib/utils'
import {getCheckRunContext} from './utils/github-utils'

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
  readonly context = getCheckRunContext()

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

      core.debug(`Creating check run: ${name}`)

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

      const annotations = await parseXmls(files)
      const lintIssues = await parseLintXmls(files)
      const conclusion = 'success'

      const resp = this.octokit.checks.update({
        check_run_id: createResp.data.id,
        conclusion,
        status: 'completed',
        output: {
          title: `Some title, yo`,
          summary: lintIssues,
          annotations: null
        },
        ...github.context.repo
      })

      core.debug(`Check run create response: ${resp.status}`)
      core.debug(`Check run URL: ${resp.data.url}`)
      core.debug(`Check run HTML: ${resp.data.html_url}`)

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
}

main()
