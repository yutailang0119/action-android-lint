import * as core from '@actions/core'
import * as xml2js from 'xml2js'
import {Annotation} from './Annotation'

export async function parseXml(reportXml: string): Promise<Annotation[]> {
  const parser = new xml2js.Parser()
  const xml = await parser.parseStringPromise(reportXml)
  return new Promise(resolve => {
    try {
      const annotations: Annotation[] = []
      for (const issueElement of xml.issues.issue) {
        const issue = issueElement.$

        for (const locationElement of issueElement.location) {
          const location = locationElement.$

          const annotation = new Annotation(
            issue.severity,
            location.file,
            parseInt(location.line),
            parseInt(location.column),
            `${issue.summary}: ${issue.message}`
          )
          annotations.push(annotation)
        }
      }
      resolve(annotations)
    } catch (error) {
      core.debug(`failed to read ${error}`)
    }
  })
}
