import { RemotePlugin } from '../remotePluginApi'
import {
  CompletionItemKind,
  CompletionItem,
  TextDocument,
  Range,
  Position,
  CompletionItemTag,
  InsertTextFormat,
} from 'vscode-languageserver-types'
import {
  NamedAttributeValue,
  doSuggestionAttributeValue,
} from '@html-language-features/html-language-service'
import { getDocumentationForAttributeValue } from '../../util/getDocumentation'
import { removeDeprecatedItems } from '../../util/removeDeprecatedItems'

const thinSpace = `\u2009`
const weirdCharAtTheEndOfTheAlphabet = `\uE83A`
const orangeIcon = CompletionItemKind.Value
const recommendationThreshold = 0.5

interface Data {
  tagName: string
  attributeName: string
  attributeValue: string
}

const createCompletionItems: ({
  tagName,
  attributeName,
  attributeValues,
}: {
  tagName: string
  attributeName: string
  attributeValues: NamedAttributeValue[]
}) => (CompletionItem & { data: Data })[] = ({
  tagName,
  attributeName,
  attributeValues,
}) => {
  const nonDeprecatedAttributes = removeDeprecatedItems(attributeValues)
  const normalizedItems = nonDeprecatedAttributes.map(item => ({
    ...item,
    recommended:
      item.probability !== undefined &&
      item.probability >= recommendationThreshold,
  }))

  // const c: CompletionItem = {
  //   documentation: {
  //     kind: 'markdown',
  //     value: '',
  //   },
  // }
  return normalizedItems.map(item => {
    const tags: CompletionItemTag[] = []
    if (item.deprecated) {
      tags.push(CompletionItemTag.Deprecated)
    }

    const kind = orangeIcon
    const insertText = item.name
    let completionItem: CompletionItem & { data: Data }
    let itemLabel = item.name
    const insertTextFormat = InsertTextFormat.Snippet

    const data: Data = {
      attributeName,
      tagName: tagName,
      attributeValue: item.name,
    }
    let detail: string | undefined
    if (item.probability !== undefined) {
      detail = `${(item.probability * 100).toFixed(2)}% Probability`
    }
    const partialItem: Partial<CompletionItem> & { data: Data } = {
      kind,
      data,
      insertText,
      tags,
      insertTextFormat,
      detail,
      // commitCharacters: [], // maybe quotes?
    }
    if (item.recommended) {
      completionItem = {
        label: `★${thinSpace}${itemLabel}`,
        filterText: item.name,
        sortText: item.name,
        ...partialItem,
      }
    } else {
      completionItem = {
        label: itemLabel,
        filterText: `${weirdCharAtTheEndOfTheAlphabet} ${item.name}`,
        sortText: `${weirdCharAtTheEndOfTheAlphabet} ${item.name}`,
        ...partialItem,
      }
    }
    return completionItem
  })
}

export const remotePluginSuggestionAttributeValue: RemotePlugin = api => {
  api.languageServer.onCompletion(
    'suggestion-attribute-value',
    ({ textDocument, position }) => {
      const document = api.documents.get(textDocument.uri) as TextDocument
      const text = document.getText(
        Range.create(Position.create(0, 0), position)
      )
      const offset = document.offsetAt(position)
      const result = doSuggestionAttributeValue(text, offset)
      if (result === undefined) {
        return undefined
      }
      return createCompletionItems(result)
    }
  )

  api.languageServer.onCompletionResolve(
    'suggestion-attribute-value',
    params => {
      const { tagName, attributeName, attributeValue } = params.data as Data
      const documentation = getDocumentationForAttributeValue(
        tagName,
        attributeName,
        attributeValue
      )
      params.documentation = documentation
      return params
    }
  )
}
