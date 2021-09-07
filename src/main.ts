import fs from 'fs'
import * as core from '@actions/core'
import * as glob from '@actions/glob'
import {echoMessages} from './command'
import {parseXml} from './parser'

async function run(): Promise<void> {
  try {
    const xmlPath = core.getInput('xml_path', {required: true})
    const globOptions = {
      followSymbolicLinks:
        core.getInput('follow-symbolic-links').toUpperCase() !== 'FALSE'
    }
    const globber = await glob.create(xmlPath, globOptions)
    const files = await globber.glob()

    const annotationsList = await Promise.all(
      files.map(async file => {
        const xml = fs.readFileSync(file, 'utf-8')
        return await parseXml(xml)
      })
    )

    echoMessages(annotationsList.flat())
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
