import * as core from '@actions/core'
import fs from 'fs'

export async function parse(reportXmlPath: string): Promise<[string]> {
  return new Promise(resolve => {
    try {
      const reportXml = fs.readFileSync(reportXmlPath)
      core.debug(`${reportXml}`)
      const buffer: [string] = ['']
      resolve(buffer)
    } catch (error) {
      core.debug(`failed to read ${error}`)
    }
  })
}
