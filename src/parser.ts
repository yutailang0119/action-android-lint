import * as core from '@actions/core'
import * as xml2js from 'xml2js'
import {Message} from './message'

const parseMessages = async (reportXml: string): Promise<Message[]> => {
  const parser = new xml2js.Parser()
  const xml = await parser.parseStringPromise(reportXml)

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

  return messages
}

export async function parseXml(reportXml: string): Promise<Message[]> {
  return new Promise(resolve => {
    try {
      const mesasges = parseMessages(reportXml)
      resolve(mesasges)
    } catch (error) {
      core.debug(`failed to read ${error}`)
    }
  })
}
