import { RemotePlugin } from '../remotePluginApi'
import {
  CompletionItem,
  CompletionItemKind,
  TextDocument,
  Range,
  Position,
} from 'vscode-languageserver-types'
import {
  doSuggestionElementStartTag,
  NamedTag,
} from '@html-language-features/html-language-service'
import { getDocumentationForTagName } from '../../util/getDocumentation'

const thinSpace = `\u2009`
const weirdCharAtTheEndOfTheAlphabet = `\uE83A`
const blueishIcon = CompletionItemKind.Variable
const recommendationThreshold = 0.12

interface Data {
  tagName: string
}

const createCompletionItems: (
  items: NamedTag[]
) => (CompletionItem & { data: Data })[] | undefined = items => {
  const normalizedItems = items.map(item => ({
    ...item,
    recommended:
      item.probability !== undefined &&
      item.probability >= recommendationThreshold,
  }))
  // const sortedItems = items.sort(
  //   (a, b) => (b.probability || 0) - (a.probability || 0)
  // )
  // const recommendedItems =
  //   sortedItems[0] && sortedItems[0].probability === 1 ? [sortedItems[0]] : []
  // const otherItems =
  //   sortedItems[0] && sortedItems[0].probability === 1
  //     ? sortedItems.slice(1)
  //     : sortedItems.slice(0)

  return normalizedItems.map(item => {
    const kind = blueishIcon
    const insertText = item.name
    let completionItem: CompletionItem & { data: Data }
    let itemLabel = item.name

    const data: Data = { tagName: item.name }

    let detail: string | undefined
    if (item.probability !== undefined) {
      detail = `${(item.probability * 100).toFixed(2)}% Probability`
    }

    const partialItem: Partial<CompletionItem> & { data: Data } = {
      kind,
      data,
      insertText,
      detail,
    }
    if (item.recommended) {
      completionItem = {
        label: `★${thinSpace}${itemLabel}`,
        filterText: itemLabel,
        sortText: itemLabel,
        ...partialItem,
      }
    } else {
      completionItem = {
        label: itemLabel,
        filterText: `${weirdCharAtTheEndOfTheAlphabet} ${itemLabel}`,
        sortText: `${weirdCharAtTheEndOfTheAlphabet} ${itemLabel}`,
        ...partialItem,
      }
    }
    return completionItem
  })
}

export const remotePluginSuggestionElementStartTag: RemotePlugin = api => {
  api.languageServer.onCompletion(
    'suggestion-element-start-tag',
    ({ textDocument, position }) => {
      const document = api.documents.get(textDocument.uri) as TextDocument
      const text = document.getText(
        Range.create(Position.create(0, 0), position)
      )
      const offset = document.offsetAt(position)
      const result = doSuggestionElementStartTag(text, offset)

      if (result === undefined) {
        return undefined
      }
      return createCompletionItems(result)
    }
  )

  api.languageServer.onCompletionResolve(
    'suggestion-element-start-tag',
    params => {
      const { tagName } = params.data as Data
      const documentation = getDocumentationForTagName(tagName)
      params.documentation = documentation
      return params
    }
  )
}
