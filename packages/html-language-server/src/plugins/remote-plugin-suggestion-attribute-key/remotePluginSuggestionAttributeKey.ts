import { RemotePlugin } from '../remotePluginApi'
import {
  CompletionItemKind,
  CompletionItem,
  TextDocument,
  Range,
  Position,
} from 'vscode-languageserver'
import {
  doSuggestionElementStartTag,
  doSuggestionAttributeKey,
} from 'html-language-service'

const thinSpace = `\u2009`
const weirdCharAtTheEndOfTheAlphabet = `\uE83A`
const blueishIcon = CompletionItemKind.Variable

const createCompletionItems: (
  items: {
    name: string
    probability: number
    // documentation?: string | undefined
  }[]
) => CompletionItem[] = items => {
  const sortedItems = items.sort((a, b) => b.probability - a.probability)
  const recommendedItems =
    sortedItems[0] && sortedItems[0].probability > 0.95 ? [sortedItems[0]] : []
  const otherItems =
    sortedItems[0] && sortedItems[0].probability > 0.95
      ? sortedItems.slice(1)
      : sortedItems.slice(0)
  console.log('all' + JSON.stringify(sortedItems))
  console.log('recommended' + JSON.stringify(recommendedItems))
  console.log('nonrecommended' + JSON.stringify(otherItems))

  return [
    ...recommendedItems.map(item => ({
      label: `★${thinSpace}${item.name}`,
      kind: blueishIcon,
      filterText: item.name,
      sortText: item.name,
      // detail: `${(item.probability * 100).toFixed(2)}% Match`,
      insertText: item.name,
      // documentation: getInfoDescriptionForHtmlTag(item.name)
      //   ? {
      //       kind: MarkupKind.Markdown,
      //       value: getInfoDescriptionForHtmlTag(item.name) as string,
      //     }
      //   : undefined,
    })),
    ...otherItems.map(item => ({
      label: item.name,
      kind: blueishIcon,
      filterText: `${weirdCharAtTheEndOfTheAlphabet} ${item.name}`,
      sortText: `${weirdCharAtTheEndOfTheAlphabet} ${item.name}`,
      // detail: `${(item.probability * 100).toFixed(2)}% Match`,
      insertText: item.name,
      // documentation: getInfoDescriptionForHtmlTag(item.name)
      //   ? {
      //       kind: MarkupKind.Markdown,
      //       value: getInfoDescriptionForHtmlTag(item.name) as string,
      //     }
      //   : undefined,
    })),
  ]
}

export const remotePluginSuggestAttributeKey: RemotePlugin = api => {
  api.languageServer.onCompletion(({ textDocument, position }) => {
    const document = api.documents.get(textDocument.uri) as TextDocument
    const text = document.getText(Range.create(Position.create(0, 0), position))
    const offset = document.offsetAt(position)
    const result = doSuggestionAttributeKey(text, offset)
    if (result === undefined) {
      return undefined
    }
    return createCompletionItems(result)
    // return undefined
  })
}
