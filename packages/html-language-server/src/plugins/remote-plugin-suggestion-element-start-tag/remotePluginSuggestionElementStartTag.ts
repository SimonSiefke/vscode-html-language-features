import { RemotePlugin } from '../remotePluginApi'
import {
  CompletionItem,
  CompletionItemKind,
  TextDocument,
  Range,
  Position,
} from 'vscode-languageserver-types'
import { doSuggestionElementStartTag } from '@html-language-features/html-language-service'
import { getDocumentationForTagName } from '../../util/getDocumentation'

const thinSpace = `\u2009`
const weirdCharAtTheEndOfTheAlphabet = `\uE83A`
const blueishIcon = CompletionItemKind.Variable

interface Data {
  tagName: string
}

const createCompletionItems: (
  items: {
    name: string
    probability?: number
    // documentation?: string | undefined
  }[]
) => (CompletionItem & { data: Data })[] | undefined = items => {
  const sortedItems = items.sort(
    (a, b) => (b.probability || 0) - (a.probability || 0)
  )
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
      data: {
        tagName: item.name,
      },
      // documentation: getDocumentationForTagName(item.name),
      // tags: [CompletionItemTag.Deprecated] as CompletionItemTag[],
    })),
    ...otherItems.map(item => ({
      label: item.name,
      kind: blueishIcon,
      filterText: `${weirdCharAtTheEndOfTheAlphabet} ${item.name}`,
      sortText: `${weirdCharAtTheEndOfTheAlphabet} ${item.name}`,
      // detail: `${(item.probability * 100).toFixed(2)}% Match`,
      insertText: item.name,
      // tags: [CompletionItemTag.Deprecated] as CompletionItemTag[],
      // documentation: getDocumentationForTagName(item.name),
      data: {
        tagName: item.name,
      },
    })),
  ]
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
        console.log('first return undefined')
        return undefined
      }
      console.log('second returb')
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
