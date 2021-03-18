import * as core from '@actions/core'
import * as glob from '@actions/glob'
import fs from 'fs'
import {parseXml} from './parser'
import {echoMessages} from './command'
import {Annotation} from './Annotation'

async function run(): Promise<void> {
  try {
    const xmlPath = core.getInput('xml_path', {required: true})
    const globOptions = {
      followSymbolicLinks:
        core.getInput('follow-symbolic-links').toUpperCase() !== 'FALSE'
    }
    const globber = await glob.create(xmlPath, globOptions)

    let annotations: Annotation[] = []
    for await (const file of globber.globGenerator()) {
      const xml = fs.readFileSync(file, 'utf-8')
      const annotation = await parseXml(xml)
      annotations = annotations.concat(annotation)
    }

    await echoMessages(annotations)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
