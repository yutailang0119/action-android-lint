import * as core from '@actions/core'
import * as glob from '@actions/glob'
import {echoMessages} from './command'
import {parseXmls} from './parser'

async function run(): Promise<void> {
  try {
    const xmlPath = core.getInput('xml-path', {required: true})
    const globOptions = {
      followSymbolicLinks: core.getBooleanInput('follow-symbolic-links')
    }
    const globber = await glob.create(xmlPath, globOptions)
    const files = await globber.glob()

    const annotations = await parseXmls(files)

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
