import path from 'path'
import {expect, test} from '@jest/globals'
import {Annotation} from '../src/annotation'
import {parseXmls, parseXml} from '../src/parser'

test('test parseXmls', () => {
  const file1 = path.join(__dirname, 'resource', 'lint-results.xml')
  const file2 = path.join(__dirname, 'resource', 'empty-results.xml')

  const annotation1 = new Annotation(
    'Warning',
    'Useless parent layout: This `RelativeLayout` layout or its `FrameLayout` parent is useless; transfer the `background` attribute to the other view',
    'layout.xml',
    11,
    22
  )
  const annotation2 = new Annotation(
    'Error',
    'Ignoring results: The result of `subscribe` is not used',
    'Foo.kt',
    33,
    44
  )

  expect(parseXmls([file1, file2], false)).resolves.toEqual([
    annotation1,
    annotation2
  ])
})

test('test parseXmls and ignore warnings', () => {
  const file1 = path.join(__dirname, 'resource', 'lint-results.xml')
  const file2 = path.join(__dirname, 'resource', 'empty-results.xml')

  const annotation2 = new Annotation(
    'Error',
    'Ignoring results: The result of `subscribe` is not used',
    'Foo.kt',
    33,
    44
  )

  expect(parseXmls([file1, file2], true)).resolves.toEqual([annotation2])
})

test('test parseXml with issues', () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <issues format="6" by="lint 7.2.1">
      <issue
          id="CheckResult"
          severity="Error"
          message="The result of \`subscribe\` is not used"
          category="Correctness"
          priority="6"
          summary="Ignoring results"
          explanation="Some methods have no side effects, and calling them without doing something without the result is suspicious."
          errorLine1="        lifecycle.subscribe { event ->"
          errorLine2="        ^">
          <location
              file="Foo.kt"
              line="33"
              column="44"/>
      </issue>
  </issues>`
  const annotation = new Annotation(
    'Error',
    'Ignoring results: The result of `subscribe` is not used',
    'Foo.kt',
    33,
    44
  )

  expect(parseXml(xml, false)).resolves.toEqual([annotation])
})

test('test parseXml without issue', () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <issues format="6" by="lint 7.2.1">
  </issues>`

  expect(parseXml(xml, false)).resolves.toEqual([])
})
