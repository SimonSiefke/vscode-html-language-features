import { RemotePlugin } from '../remotePluginApi'
import {
  TextDocumentPositionParams,
  CompletionItem,
  CompletionItemKind,
  TextDocument,
  Range,
  Position,
  CompletionList,
  CompletionItemTag,
  TextEdit,
  MarkupKind,
} from 'vscode-languageserver'
import { doSuggestionElementStartTag } from 'html-language-service'
import {
  getInfoForHtmlTag,
  getInfoDescriptionForHtmlTag,
  getInfoReference,
} from 'html-language-service'

const thinSpace = `\u2009`
const weirdCharAtTheEndOfTheAlphabet = `\uE83A`
const blueishIcon = CompletionItemKind.Variable

const getDocumentationForTagName = (tagName: string) => {
  const description = getInfoDescriptionForHtmlTag(tagName)
  if (!description) {
    return undefined
  }
  let finalDescription = description
  const reference = getInfoReference(tagName)
  if (reference) {
    finalDescription = `${finalDescription}\n\n[${reference.name}](${reference.url})`
  }
  return {
    kind: MarkupKind.Markdown,
    value: finalDescription,
  }
}
const createCompletionItems: (
  items: {
    name: string
    probability: number
    // documentation?: string | undefined
  }[]
) => CompletionItem[] | undefined = items => {
  const sortedItems = items.sort((a, b) => b.probability - a.probability)
  const recommendedItems =
    sortedItems[0] && sortedItems[0].probability === 1 ? [sortedItems[0]] : []
  const otherItems =
    sortedItems[0] && sortedItems[0].probability === 1
      ? sortedItems.slice(1)
      : sortedItems.slice(0)
  // console.log('recommended' + JSON.stringify(recommendedItems))

  return [
    ...recommendedItems.map(item => ({
      label: `★${thinSpace}${item.name}`,
      kind: blueishIcon,
      filterText: item.name,
      sortText: item.name,
      // detail: `${(item.probability * 100).toFixed(2)}% Match`,
      insertText: item.name,
      documentation: getDocumentationForTagName(item.name),
    })),
    ...otherItems.map(item => ({
      label: item.name,
      kind: blueishIcon,
      filterText: `${weirdCharAtTheEndOfTheAlphabet} ${item.name}`,
      sortText: `${weirdCharAtTheEndOfTheAlphabet} ${item.name}`,
      // detail: `${(item.probability * 100).toFixed(2)}% Match`,
      insertText: item.name,
      documentation: getDocumentationForTagName(item.name),
    })),
  ]
}

export const remotePluginSuggestionElementStartTag: RemotePlugin = api => {
  api.languageServer.onCompletion(({ textDocument, position }) => {
    const document = api.documents.get(textDocument.uri) as TextDocument
    const text = document.getText(Range.create(Position.create(0, 0), position))
    const offset = document.offsetAt(position)
    const result = doSuggestionElementStartTag(text, offset)

    if (result === undefined) {
      console.log('first return undefined')
      return undefined
    }
    console.log('second returb')
    return createCompletionItems(result)
  })
}
