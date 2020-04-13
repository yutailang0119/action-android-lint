import * as core from '@actions/core'
import fs from 'fs'
import {parseXml} from './parser'
import {echoMessages} from './command'

async function run(): Promise<void> {
  try {
    const xmlPath = core.getInput('xml_path', {required: true})
    const xml = fs.readFileSync(xmlPath, 'utf-8')
    const annotations = await parseXml(xml)
    await echoMessages(annotations)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
