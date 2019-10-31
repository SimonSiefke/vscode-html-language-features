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
  doSuggestionAttributeName,
  NamedAttribute,
} from '@html-language-features/html-language-service'
import { getDocumentationForAttributeName } from '../../util/getDocumentation'
import { removeDeprecatedItems } from '../../util/removeDeprecatedItems'

const thinSpace = `\u2009`
const weirdCharAtTheEndOfTheAlphabet = `\uE83A`
const orangeIcon = CompletionItemKind.Value
const recommendationThreshold = 0.1

interface Data {
  tagName: string
  attributeName: string
}

const createCompletionItems: ({
  attributes,
  tagName: string,
}: {
  attributes: NamedAttribute[]
  tagName: string
}) => (CompletionItem & { data: Data })[] = ({ attributes, tagName }) => {
  const nonDeprecatedAttributes = removeDeprecatedItems(attributes)
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
    // const documentation = getDocumentationForAttributeName(tagName, item.name)
    // let documentation: MarkupContent | undefined
    // // const documentation = getDocumentationForAttributeName(item.)
    // if (item.description) {
    //   documentation = {
    //     kind: MarkupKind.Markdown,
    //     value: item.description,
    //   }
    // }
    const kind = orangeIcon
    const insertText = item.name + '="$1"'
    let completionItem: CompletionItem & { data: Data }
    let itemLabel = item.name
    const insertTextFormat = InsertTextFormat.Snippet

    const data: Data = { attributeName: item.name, tagName: tagName }
    // TODO wait for experimental completion tags from lsp
    // if (item.experimental) {
    //   itemLabel = itemLabel + ' (experimental)'
    // }
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
      // commitCharacters: [],
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
        // detail: `${(item.probability * 100).toFixed(2)}% Match`,
      }
    }
    return completionItem
  })
}

export const remotePluginSuggestionAttributeName: RemotePlugin = api => {
  api.languageServer.onCompletion(
    'suggestion-attribute-key',
    ({ textDocument, position }) => {
      const document = api.documents.get(textDocument.uri) as TextDocument
      const text = document.getText(
        Range.create(Position.create(0, 0), position)
      )
      const offset = document.offsetAt(position)
      const result = doSuggestionAttributeName(text, offset)
      if (result === undefined) {
        return undefined
      }
      return createCompletionItems(result)
    }
  )

  api.languageServer.onCompletionResolve('suggestion-attribute-key', params => {
    const { tagName, attributeName } = params.data as Data
    const documentation = getDocumentationForAttributeName(
      tagName,
      attributeName
    )
    params.documentation = documentation
    return params
  })
}
