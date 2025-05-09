import * as core from '@actions/core'
import * as fs from 'fs'
import * as xml2js from 'xml2js'
import { Annotation } from './annotation.js'

export const parseXmls = async (
  files: string[],
  ignoreWarnings: boolean
): Promise<Annotation[]> => {
  const list = await Promise.all(
    files.map(async (file) => {
      const xml = fs.readFileSync(file, 'utf-8')
      return await parseXml(xml, ignoreWarnings)
    })
  )
  return list.flat()
}

export const parseXml = async (
  text: string,
  ignoreWarnings: boolean
): Promise<Annotation[]> => {
  const parser = new xml2js.Parser()
  const xml = await parser.parseStringPromise(text)
  if (xml.issues.issue === undefined) return []
  return new Promise((resolve) => {
    try {
      const annotations: Annotation[] = []
      for (const issueElement of xml.issues.issue) {
        const issue = issueElement.$
        for (const locationElement of issueElement.location) {
          const location = locationElement.$

          const annotation = new Annotation(
            issue.severity,
            `${issue.summary}: ${issue.message}`,
            location.file,
            parseInt(location.line),
            parseInt(location.column)
          )
          annotations.push(annotation)
        }
      }
      if (ignoreWarnings === true) {
        resolve(
          annotations.filter((annotation) => {
            return annotation.severityLevel !== 'warning'
          })
        )
      } else {
        resolve(annotations)
      }
    } catch (error) {
      core.debug(`failed to read ${error}`)
    }
  })
}
