import * as core from '@actions/core'
import fs from 'fs'
import {parseXml} from './parser'
import {echoMessages} from './command'

async function run(): Promise<void> {
  try {
    const reportXmlPath = core.getInput('reportXmlPath', {required: true})
    const reportXml = fs.readFileSync(reportXmlPath, 'utf-8')
    const messages = await parseXml(reportXml)
    await echoMessages(messages)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
