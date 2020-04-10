import * as core from '@actions/core'
import * as xml2js from 'xml2js'
import fs from 'fs'
import {Annotation} from './annotation'

const parseToAnnotations = async (reportXml: string): Promise<Annotation[]> => {
  const parser = new xml2js.Parser()
  const xml = await parser.parseStringPromise(reportXml)

  const annotations: Annotation[] = []
  for (const issue of xml.issues.issue) {
    const data = issue.$

    for (const entry of issue.location) {
      const location = entry.$

      const annotation = new Annotation(
        data.severity,
        location.file,
        parseInt(location.line),
        parseInt(location.column),
        data.summary,
        data.message
      )
      core.debug(`Severity: ${annotation.severity}`)
      core.debug(`Summary: ${annotation.summary}`)
      core.debug(`Mesage: ${annotation.message}`)
      annotations.push(annotation)
    }
  }

  return annotations
}

export async function parse(reportXmlPath: string): Promise<Annotation[]> {
  return new Promise(resolve => {
    try {
      const reportXml = fs.readFileSync(reportXmlPath, 'utf-8')
      const annotations = parseToAnnotations(reportXml)
      resolve(annotations)
    } catch (error) {
      core.debug(`failed to read ${error}`)
    }
  })
}
