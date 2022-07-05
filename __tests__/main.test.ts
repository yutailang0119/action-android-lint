import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import {expect, test} from '@jest/globals'

// shows how the runner will run a javascript action with env / stdout protocol
test('test runs', () => {
  process.env['INPUT_REPORT-PATH'] = path.join(__dirname, 'resource', '*.xml')
  process.env['INPUT_FOLLOW-SYMBOLIC-LINKS'] = 'true'
  const np = process.execPath
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecFileSyncOptions = {
    env: process.env
  }

  try {
    const stdout = cp.execFileSync(np, [ip], options)
    console.log(stdout.toString())
    expect.assertions(1)
  } catch (error: any) {
    console.log(error.stdout.toString())
    expect(error.status).toEqual(1)
  }
})
