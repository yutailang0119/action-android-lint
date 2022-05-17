// eslint-disable-next-line filenames/match-regex
export enum Align {
  Left = ':---',
  Center = ':---:',
  Right = '---:',
  Home = '---'
}

export function link(title: string, address: string): string {
  return `[${title}](${address})`
}

type ToString = string | number | boolean | Date
export function table(
  headers: ToString[],
  align: ToString[],
  ...rows: ToString[][]
): string {
  const headerRow = `|${headers.map(tableEscape).join('|')}|`
  const alignRow = `|${align.join('|')}|`
  const contentRows = rows
    .map(row => `|${row.map(tableEscape).join('|')}|`)
    .join('\n')
  return [headerRow, alignRow, contentRows].join('\n')
}

export function tableEscape(content: ToString): string {
  return content.toString().replace('|', '\\|')
}

export function fixEol(text?: string): string {
  return text?.replace(/\r/g, '') ?? ''
}

export function ellipsis(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text
  }

  return `${text.substr(0, maxLength - 3)}...`
}
