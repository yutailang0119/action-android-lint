import {parse} from '../src/parser'
import * as path from 'path'

test('test parse', () => {
  const filePath = path.join(__dirname, '..', 'lint-results.xml')
  parse(filePath)
})
