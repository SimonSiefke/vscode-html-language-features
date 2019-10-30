import { RemotePlugin } from '../remotePluginApi'
import {
  CompletionItemKind,
  CompletionItem,
  TextDocument,
  Range,
  Position,
  CompletionItemTag,
} from 'vscode-languageserver-types'
import { doSuggestionAttributeKey } from '@html-language-features/html-language-service'
import { getDocumentationForAttributeName } from '../../util/getDocumentation'
import { removeDeprecatedItems } from '../../util/removeDeprecatedItems'

const thinSpace = `\u2009`
const weirdCharAtTheEndOfTheAlphabet = `\uE83A`
const orangeIcon = CompletionItemKind.Value

interface Data {
  tagName: string | undefined
  attributeName: string
}

const createCompletionItems: ({
  tagName,
  attributes,
}: {
  tagName?: string
  attributes: {
    name: string
    probability?: number
    deprecated?: boolean
  }[]
}) => (CompletionItem & { data: Data })[] = ({ tagName, attributes }) => {
  const nonDeprecatedAttributes = removeDeprecatedItems(attributes)
  console.log(JSON.stringify(attributes))
  const normalizedItems: {
    name: string
    deprecated?: boolean
    recommended: boolean
    experimental?: boolean
  }[] = nonDeprecatedAttributes.map(item => ({
    ...item,
    recommended: item.probability !== undefined && item.probability > 0.8,
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
    const insertText = item.name
    let completionItem: CompletionItem & { data: Data }
    let itemLabel = item.name

    const data: Data = { attributeName: item.name, tagName: tagName }
    // TODO wait for experimental completion tags from lsp
    // if (item.experimental) {
    //   itemLabel = itemLabel + ' (experimental)'
    // }
    if (item.recommended) {
      completionItem = {
        label: `★${thinSpace}${itemLabel}`,
        kind,
        filterText: item.name,
        sortText: item.name,
        data,
        // detail: `${(item.probability * 100).toFixed(2)}% Match`,
        insertText,
        tags,
        documentation: 'hello world',
      }
    } else {
      completionItem = {
        label: itemLabel,
        kind,
        tags,
        data,
        filterText: `${weirdCharAtTheEndOfTheAlphabet} ${item.name}`,
        sortText: `${weirdCharAtTheEndOfTheAlphabet} ${item.name}`,
        documentation: 'hello world',
        // detail: `${(item.probability * 100).toFixed(2)}% Match`,
        insertText,
      }
    }
    return completionItem
  })
}

export const remotePluginSuggestionAttributeKey: RemotePlugin = api => {
  api.languageServer.onCompletion(
    'suggestion-attribute-key',
    ({ textDocument, position }) => {
      const document = api.documents.get(textDocument.uri) as TextDocument
      const text = document.getText(
        Range.create(Position.create(0, 0), position)
      )
      const offset = document.offsetAt(position)
      const result = doSuggestionAttributeKey(text, offset)
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
