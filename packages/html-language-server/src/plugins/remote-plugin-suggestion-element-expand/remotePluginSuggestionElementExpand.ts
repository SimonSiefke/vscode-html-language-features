import {
  doSuggestionElementExpand,
  getSuggestedTags,
  isSelfClosingTag,
  NamedTag,
  shouldHaveNewline,
} from '@html-language-features/html-language-service'
import {
  CompletionItem,
  CompletionItemKind,
  InsertTextFormat,
  Position,
  Range,
  TextDocument,
} from 'vscode-languageserver-types'
import { RemotePlugin } from '../remotePluginApi'

// const thinSpace = `\u2009`
// const weirdCharAtTheEndOfTheAlphabet = `\uE83A`
const blueishIcon = CompletionItemKind.Variable
// const recommendationThreshold = 0.12

interface Data {
  tagName: string
}

const createCompletionItems: (
  items: NamedTag[]
) => (CompletionItem & { data: Data })[] = items => {
  const normalizedItems = items
  // .map(item => ({
  // ...item,
  // recommended:
  // item.probability !== undefined &&
  // item.probability >= recommendationThreshold,
  // }))

  return normalizedItems.map(item => {
    const kind = blueishIcon
    let insertText: string
    if (isSelfClosingTag(item.name)) {
      insertText = `<${item.name}>`
    } else if (shouldHaveNewline(item.name)) {
      insertText = `<${item.name}>\n\t\${0}\n</${item.name}>`
    } else {
      insertText = `<${item.name}>\${0}</${item.name}>`
    }
    let completionItem: CompletionItem & { data: Data }
    let itemLabel = item.name

    const data: Data = { tagName: item.name }

    let detail: string | undefined
    // if (item.probability !== undefined) {
    //   detail = `${(item.probability * 100).toFixed(2)}% Probability`
    // }

    const partialItem: Partial<CompletionItem> & { data: Data } = {
      kind,
      data,
      insertText,
      detail,
      insertTextFormat: InsertTextFormat.Snippet,
    }

    completionItem = {
      label: itemLabel,
      ...partialItem,
    }
    // if (item.recommended) {
    //   completionItem = {
    //     label: `★${thinSpace}${itemLabel}`,
    //     filterText: itemLabel,
    //     sortText: itemLabel,
    //     ...partialItem,
    //   }
    // } else {
    //   completionItem = {
    //     label: itemLabel,
    //     filterText: `${weirdCharAtTheEndOfTheAlphabet} ${itemLabel}`,
    //     sortText: `${weirdCharAtTheEndOfTheAlphabet} ${itemLabel}`,
    //     ...partialItem,
    //   }
    // }
    return completionItem
  })
}

export const remotePluginSuggestionElementExpand: RemotePlugin = api => {
  api.languageServer.onCompletion(
    'suggestion-element-expand',
    ({ textDocument, position }) => {
      const document = api.documents.get(textDocument.uri) as TextDocument
      const text = document.getText(
        Range.create(Position.create(0, 0), position)
      )
      const offset = document.offsetAt(position)
      const result = doSuggestionElementExpand(text, offset)
      if (result === undefined) {
        return undefined
      }
      const suggestedTags = getSuggestedTags(result.tagName)
      if (suggestedTags === undefined) {
        return undefined
      }
      // const snippets = getSuggestedSnippets(result.tagName) || []
      const snippets: any[] = []

      // const createCompletionItemsForSnippets = (
      //   snippets: { name: string; value: string }[]
      // ) =>
      //   snippets.map(snippet => ({
      //     label: snippet.name,
      //     insertText: snippet.value,
      //     insertTextFormat: InsertTextFormat.Snippet,
      //     kind: blueishIcon,
      //   }))

      const filteredTags = suggestedTags.filter(
        tag => !snippets.find(snippet => snippet.name === tag.name)
      )
      const suggestedTagItems = createCompletionItems(filteredTags)

      // const snippetsItems = createCompletionItemsForSnippets(snippets)
      return {
        isIncomplete: false,
        items: [...suggestedTagItems],
      }
    }
  )

  api.languageServer.onCompletionResolve(
    'suggestion-element-expand',
    params => {
      // const { tagName } = params.data as Data
      // const documentation = getDocumentationForTagName(tagName)
      // params.documentation = documentation
      return params
    }
  )
}
