import {workflowMessage} from '../src/command'
import {Annotation} from '../src/annotation'

test('test warning workflow-message', () => {
  const path = 'foo/bar/piyo'
  const line = 11
  const column = 22
  const description =
    'ScrollViewSize: This LinearLayout should use `android:layout_height=&quot;wrap_content&quot;`'
  const annotation = new Annotation('Warning', path, line, column, description)
  expect(workflowMessage(annotation)).toEqual(
    `::warning file=${[path]},line=${line},col=${column}::${description}`
  )
})

test('test error workflow-message', () => {
  const path = 'foo/bar/piyo'
  const line = 33
  const column = 44
  const description =
    'ScrollViewSize: This LinearLayout should use `android:layout_height=&quot;wrap_content&quot;`'
  const annotation = new Annotation('Error', path, line, column, description)
  expect(workflowMessage(annotation)).toEqual(
    `::error file=${[path]},line=${line},col=${column}::${description}`
  )
})
