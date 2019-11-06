import {
  doCompletionElementExpand,
  isDeprecatedTag,
  isSelfClosingTag,
  shouldHaveNewline,
} from '@html-language-features/html-language-service'
import {
  Position,
  Range,
  TextDocument,
  CompletionItem,
  CompletionItemKind,
  InsertTextFormat,
  CompletionItemTag,
} from 'vscode-languageserver'
import { RemotePlugin } from '../remotePlugin'
import { constants } from '../../constants'

interface Data {
  tagName: string
}

type CompletionItemWithData = CompletionItem & { data: Data }

const blueishIcon = CompletionItemKind.Variable
const insertTextFormat = InsertTextFormat.Snippet

const createCompletionItem: (
  item: string
) => CompletionItemWithData | undefined = item => {
  let insertText: string
  if (isSelfClosingTag(item)) {
    insertText = `<${item}>`
  } else if (shouldHaveNewline(item)) {
    insertText = `<${item}>\n\t\${0}\n</${item}>`
  } else {
    insertText = `<${item}>\${0}</${item}>`
  }
  // insertText = `<${item}>\n\t\${0}\n</${item}>`
  const completionItem: CompletionItemWithData = {
    data: {
      tagName: item,
    },
    insertText,
    insertTextFormat,
    kind: blueishIcon,
    label: item,
  }
  if (isDeprecatedTag(item)) {
    if (constants.showDeprecatedCompletions === true) {
      completionItem.tags = [CompletionItemTag.Deprecated]
    } else {
      return undefined
    }
  }
  return completionItem
}

// const thinSpace = `\u2009`
// const weirdCharAtTheEndOfTheAlphabet = `\uE83A`
// const blueishIcon = CompletionItemKind.Variable
// // const recommendationThreshold = 0.12

// interface Data {
//   tagName: string
// }

// const createCompletionItems: (
//   items: NamedTag[]
// ) => (CompletionItem & { data: Data })[] = items => {
//   const normalizedItems = items
//   // .map(item => ({
//   // ...item,
//   // recommended:
//   // item.probability !== undefined &&
//   // item.probability >= recommendationThreshold,
//   // }))

//   return normalizedItems.map(item => {
//     const kind = blueishIcon
//     let insertText: string
//     if (isSelfClosingTag(item.name)) {
//       insertText = `<${item.name}>`
//     } else if (shouldHaveNewline(item.name)) {
//       insertText = `<${item.name}>\n\t\${0}\n</${item.name}>`
//     } else {
//       insertText = `<${item.name}>\${0}</${item.name}>`
//     }
//     let completionItem: CompletionItem & { data: Data }
//     let itemLabel = item.name

//     const data: Data = { tagName: item.name }

//     let detail: string | undefined
//     // if (item.probability !== undefined) {
//     //   detail = `${(item.probability * 100).toFixed(2)}% Probability`
//     // }

//     const partialItem: Partial<CompletionItem> & { data: Data } = {
//       kind,
//       data,
//       insertText,
//       detail,
//       insertTextFormat: InsertTextFormat.Snippet,
//     }

//     completionItem = {
//       label: itemLabel,
//       ...partialItem,
//     }
//     // if (item.recommended) {
//     //   completionItem = {
//     //     label: `★${thinSpace}${itemLabel}`,
//     //     filterText: itemLabel,
//     //     sortText: itemLabel,
//     //     ...partialItem,
//     //   }
//     // } else {
//     //   completionItem = {
//     //     label: itemLabel,
//     //     filterText: `${weirdCharAtTheEndOfTheAlphabet} ${itemLabel}`,
//     //     sortText: `${weirdCharAtTheEndOfTheAlphabet} ${itemLabel}`,
//     //     ...partialItem,
//     //   }
//     // }
//     return completionItem
//   })
// }

export const remotePluginCompletionElementExpand: RemotePlugin = api => {
  api.connectionProxy.onCompletion(
    'completion-element-expand',
    ({ textDocument, position }) => {
      const document = api.documentsProxy.get(textDocument.uri) as TextDocument
      const text = document.getText(
        Range.create(Position.create(0, 0), position)
      )
      const offset = document.offsetAt(position)
      const results = doCompletionElementExpand(text, offset)
      const items = results
        .map(createCompletionItem)
        .filter(Boolean) as CompletionItemWithData[]
      if (items.length === 0) {
        return undefined
      }
      return {
        isIncomplete: false,
        items,
      }
      // const snippets = getSuggestedSnippets(result.tagName) || []
      // const snippets: any[] = []

      // const createCompletionItemsForSnippets = (
      //   snippets: { name: string; value: string }[]
      // ) =>
      //   snippets.map(snippet => ({
      //     label: snippet.name,
      //     insertText: snippet.value,
      //     insertTextFormat: InsertTextFormat.Snippet,
      //     kind: blueishIcon,
      //   }))

      // const filteredTags = suggestedTags.filter(
      //   tag => !snippets.find(snippet => snippet.name === tag.name)
      // )
      // const suggestedTagItems = createCompletionItems(filteredTags)

      // const snippetsItems = createCompletionItemsForSnippets(snippets)
      // return {
      //   isIncomplete: false,
      //   items: [...suggestedTagItems],
      // }
      // return undefined
    }
  )

  api.connectionProxy.onCompletionResolve(
    'completion-element-expand',
    params => {
      // const { tagName } = params.data as Data
      // const documentation = getDocumentationForTagName(tagName)
      // params.documentation = documentation
      return params
    }
  )
}
