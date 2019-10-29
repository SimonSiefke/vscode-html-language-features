import { RemotePlugin } from '../remotePluginApi'
import {
  CompletionItemKind,
  CompletionItem,
  TextDocument,
  Range,
  Position,
  CompletionItemTag,
  MarkupKind,
  MarkupContent,
} from 'vscode-languageserver'
import { doSuggestionAttributeKey } from '@html-language-features/html-language-service'

const thinSpace = `\u2009`
const weirdCharAtTheEndOfTheAlphabet = `\uE83A`
const orangeIcon = CompletionItemKind.Value

const createCompletionItems: (
  items: {
    name: string
    probability?: number
    deprecated?: boolean
    description?: string
    // documentation?: string | undefined
  }[]
) => CompletionItem[] = items => {
  // const sortedItems = items.sort(
  //   (a, b) => (b.probability || 0) - (a.probability || 0)
  // )
  // const recommendedItems =
  //   sortedItems[0] &&
  //   sortedItems[0].probability !== undefined &&
  //   sortedItems[0].probability > 0.95
  //     ? [sortedItems[0]]
  //     : []
  // const otherItems =
  //   sortedItems[0] &&
  //   sortedItems[0].probability !== undefined &&
  //   sortedItems[0].probability > 0.95
  //     ? sortedItems.slice(1)
  //     : sortedItems.slice(0)
  // console.log('all' + JSON.stringify(sortedItems))
  // console.log('recommended' + JSON.stringify(recommendedItems))
  // console.log('nonrecommended' + JSON.stringify(otherItems))

  const normalizedItems: {
    name: string
    deprecated?: boolean
    recommended: boolean
    description?: string
  }[] = items.map(item => ({
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
    let documentation: MarkupContent | undefined
    if (item.description) {
      documentation = {
        kind: MarkupKind.Markdown,
        value: item.description,
      }
    }
    const kind = orangeIcon
    const insertText = item.name
    let completionItem: CompletionItem
    if (item.recommended) {
      completionItem = {
        label: `★${thinSpace}${item.name}`,
        kind,
        filterText: item.name,
        sortText: item.name,
        documentation,
        // detail: `${(item.probability * 100).toFixed(2)}% Match`,
        insertText,
        tags,
      }
    } else {
      completionItem = {
        label: item.name,
        kind,
        tags,
        documentation,
        filterText: `${weirdCharAtTheEndOfTheAlphabet} ${item.name}`,
        sortText: `${weirdCharAtTheEndOfTheAlphabet} ${item.name}`,
        // detail: `${(item.probability * 100).toFixed(2)}% Match`,
        insertText,
      }
    }
    return completionItem
  })
  // return [
  //   ...recommendedItems.map(item => {
  //     const tags: CompletionItemTag[] = []
  //     if (item.deprecated) {
  //       tags.push(CompletionItemTag.Deprecated)
  //     }
  //     return {
  //       label: `★${thinSpace}${item.name}`,
  //       kind: orangeIcon,
  //       filterText: item.name,
  //       sortText: item.name,
  //       // detail: `${(item.probability * 100).toFixed(2)}% Match`,
  //       insertText: item.name,
  //       tags,
  //       // documentation: getInfoDescriptionForHtmlTag(item.name)
  //       //   ? {
  //       //       kind: MarkupKind.Markdown,
  //       //       value: getInfoDescriptionForHtmlTag(item.name) as string,
  //       //     }
  //       //   : undefined,
  //     }
  //   }),
  //   ...otherItems.map(
  //     item =>
  //       <CompletionItem>{
  //         label: item.name,
  //         kind: orangeIcon,
  //         tags: [CompletionItemTag.Deprecated] as CompletionItemTag[],
  //         filterText: `${weirdCharAtTheEndOfTheAlphabet} ${item.name}`,
  //         sortText: `${weirdCharAtTheEndOfTheAlphabet} ${item.name}`,
  //         // detail: `${(item.probability * 100).toFixed(2)}% Match`,
  //         insertText: item.name,
  //         // documentation: getInfoDescriptionForHtmlTag(item.name)
  //         //   ? {
  //         //       kind: MarkupKind.Markdown,
  //         //       value: getInfoDescriptionForHtmlTag(item.name) as string,
  //         //     }
  //         //   : undefined,
  //       }
  //   ),
  // ]
}

export const remotePluginSuggestionAttributeKey: RemotePlugin = api => {
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
