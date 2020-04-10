import {parseXml} from '../src/parser'

test('test parse', () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <issues format="5" by="lint 3.6.1">
      <issue
          id="ScrollViewSize"
          severity="Warning"
          message="This LinearLayout should use \`android:layout_height=&quot;wrap_content&quot;\`"
          category="Correctness"
          priority="7"
          summary="ScrollView size validation"
          explanation="ScrollView children must set their \`layout_width\` or \`layout_height\` attributes to \`wrap_content\` rather than \`fill_parent\` or \`match_parent\` in the scrolling dimension"
          errorLine1="                android:layout_height=&quot;match_parent&quot;"
          errorLine2="                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~">
          <location
              file="layout.xml"
              line="32"
              column="17"/>
      </issue>
  </issues>`
  const message = expect(parseXml(xml))
})
