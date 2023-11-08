import * as core from '@actions/core'
import * as glob from '@actions/glob'
import {echoMessages} from './command'
import {parseXmls} from './parser'

async function run(): Promise<void> {
  try {
    const reportPath = core.getInput('report-path', {required: true})
    const ignoreWarnings = core.getBooleanInput('ignore-warnings')
    const globOptions = {
      followSymbolicLinks: core.getBooleanInput('follow-symbolic-links')
    }
    const globber = await glob.create(reportPath, globOptions)
    const files = await globber.glob()

    const annotations = await parseXmls(files, ignoreWarnings)

    echoMessages(annotations)

    const errors = annotations.filter(annotation => {
      return annotation.severityLevel === 'error'
    })
    if (errors.length) {
      const unit = errors.length === 1 ? 'error' : 'errors'
      throw Error(`Android Lint with ${errors.length} ${unit}`)
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
