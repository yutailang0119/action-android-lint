import {expect, test} from '@jest/globals'
import {Annotation} from '../src/annotation'

test('test Annotation.constructor with Warning', () => {
  const annotation = new Annotation(
    'Warning',
    'Useless parent layout: This `RelativeLayout` layout or its `FrameLayout` parent is useless; transfer the `background` attribute to the other view',
    'layout.xml',
    11,
    22
  )
  expect(annotation.severityLevel).toEqual('warning')
  expect(annotation.message).toEqual(
    'Useless parent layout: This `RelativeLayout` layout or its `FrameLayout` parent is useless; transfer the `background` attribute to the other view'
  )
  expect(annotation.properties).toEqual({
    file: 'layout.xml',
    startLine: 11,
    startColumn: 22
  })
})

test('test Annotation.constructor with Error', () => {
  const annotation = new Annotation(
    'Error',
    'Ignoring results: The result of `subscribe` is not used',
    'Foo.kt',
    33,
    44
  )
  expect(annotation.severityLevel).toEqual('error')
  expect(annotation.message).toEqual(
    'Ignoring results: The result of `subscribe` is not used'
  )
  expect(annotation.properties).toEqual({
    file: 'Foo.kt',
    startLine: 33,
    startColumn: 44
  })
})

test('test Annotation.constructor with Other', () => {
  const annotation = new Annotation('', '', 'layout.xml', 0, 0)
  expect(annotation.severityLevel).toEqual('warning')
})
