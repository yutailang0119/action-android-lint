import * as core from '@actions/core'
import {Parser} from 'htmlparser2'
import fs from 'fs'

export async function parse(reportXmlPath: string): Promise<string[]> {
  return new Promise(resolve => {
    try {
      const reportXml = fs.readFileSync(reportXmlPath, 'utf-8')
      const buffer: string[] = []
      const parser = new Parser(
        {
          ontext(text) {
            core.debug(`--> ${text}`)
          }
        },
        {
          decodeEntities: false,
          xmlMode: true
        }
      )
      parser.write(reportXml)
      parser.end()
      resolve(buffer)
    } catch (error) {
      core.debug(`failed to read ${error}`)
    }
  })
}
