import * as core from '@actions/core'

async function run(): Promise<void> {
  try {
    const reportXmlPath = core.getInput('reportXmlPath', {required: true})
    core.debug(`Report xml path: ${reportXmlPath}`)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
