import * as core from '@actions/core'
import {parse} from './parser'
import {echoMessages} from './command'

async function run(): Promise<void> {
  try {
    const reportXmlPath = core.getInput('reportXmlPath', {required: true})
    const messages = await parse(reportXmlPath)
    await echoMessages(messages)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
