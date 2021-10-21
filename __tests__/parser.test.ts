import path from 'path'
import {expect, test} from '@jest/globals'
import {Annotation} from '../src/annotation'
import {parseXmls, parseXml} from '../src/parser'

test('test parseXmls', () => {
  const file = path.join(__dirname, 'resource', 'lint-results.xml')

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

  expect(parseXmls([file])).resolves.toEqual([annotation1, annotation2])
})

test('test parseXml', () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <issues format="5" by="lint 3.6.1">
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
  expect(parseXml(xml)).resolves.toEqual([annotation])
})
