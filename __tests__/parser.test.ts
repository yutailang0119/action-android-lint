import {parseXml} from '../src/parser'
import {Annotation} from '../src/Annotation'

test('test parse', () => {
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
    'Foo.kt',
    33,
    44,
    'Ignoring results: The result of `subscribe` is not used'
  )
  expect(parseXml(xml)).resolves.toEqual([annotation])
})
