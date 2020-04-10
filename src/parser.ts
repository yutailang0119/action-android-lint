import * as core from '@actions/core'
import * as xml2js from 'xml2js'
import {Message} from './message'

export async function parseXml(reportXml: string): Promise<Message[]> {
  const parser = new xml2js.Parser()
  const xml = await parser.parseStringPromise(reportXml)
  return new Promise(resolve => {
    try {
      const messages: Message[] = []
      for (const issueElement of xml.issues.issue) {
        const issue = issueElement.$

        for (const locationElement of issueElement.location) {
          const location = locationElement.$

          const message = new Message(
            issue.severity,
            location.file,
            parseInt(location.line),
            parseInt(location.column),
            `${issue.summary}: ${issue.message}`
          )
          core.debug(`Severity: ${message.severity}`)
          core.debug(`Summary: ${message.description}`)
          messages.push(message)
        }
      }
      resolve(messages)
    } catch (error) {
      core.debug(`failed to read ${error}`)
    }
  })
}
