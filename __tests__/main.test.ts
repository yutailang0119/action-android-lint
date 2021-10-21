import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import {expect, test} from '@jest/globals'

// shows how the runner will run a javascript action with env / stdout protocol
test('test runs', () => {
  process.env['INPUT_XML_PATH'] = path.join(__dirname, 'resource', '*.xml')
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecSyncOptions = {
    env: process.env
  }

  try {
    const stdout = cp.execSync(`node ${ip}`, options)
    console.log(stdout)
    expect.assertions(1)
  } catch (error: any) {
    console.log(error.stdout.toString())
    expect(error.status).toEqual(1)
  }
})
