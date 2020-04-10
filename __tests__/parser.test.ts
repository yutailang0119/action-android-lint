import {parse} from '../src/parser'
import * as path from 'path'

test('test parse', () => {
  // process.env['INPUT_REPORTXMLPATH'] = 'foo/bar/piyo'
  const filePath = path.join(__dirname, '..', 'lint-results.xml')
  parse(filePath)
})