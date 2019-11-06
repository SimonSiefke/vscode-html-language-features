const simpleHtmlDocument = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>title</title>
  </head>
  <body>
    \${0}
  </body>
</html>
`.trim()

export const doCompletionElementSimpleDocument: (
  text: string,
  offset: number
) => string[] = (text, offset) => {
  const previousChar = text[offset - 1]
  if (previousChar !== '!') {
    return []
  }
  const previousText = text.slice(0, offset - 1)
  if (previousText.trim()) {
    return []
  }
  return [simpleHtmlDocument]
}
