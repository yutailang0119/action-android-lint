import * as core from '@actions/core'

async function run(): Promise<void> {
  try {
    const reportFilePath = core.getInput('reportFilePath', {required: true})
    core.debug(`Report filr path: ${reportFilePath}`)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
