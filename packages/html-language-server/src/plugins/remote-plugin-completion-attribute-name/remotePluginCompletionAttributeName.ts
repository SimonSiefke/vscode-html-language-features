import { RemotePlugin } from '../remotePlugin'
import {
  CompletionItemKind,
  CompletionItem,
  Range,
  Position,
  CompletionItemTag,
  InsertTextFormat,
} from 'vscode-languageserver-types'
import {
  doCompletionAttributeName,
  NamedAttribute,
} from '@html-language-features/html-language-service'
import { getDocumentationForAttributeName } from '../../util/getDocumentation'
import { constants } from '../../constants'

interface Data {
  tagName: string
  attributeName: string
}

type CompletionItemWithData = CompletionItem & { data: Data }

const kind = CompletionItemKind.Value
const insertTextFormat = InsertTextFormat.Snippet

const createCompletionItem: ({
  attribute,
  tagName,
}: {
  attribute: NamedAttribute
  tagName: string
}) => CompletionItemWithData | undefined = ({ attribute, tagName }) => {
  const completionItem: CompletionItemWithData = {
    data: {
      attributeName: attribute.name,
      tagName,
    },
    insertText: `${attribute.name}="$1"`,
    insertTextFormat,
    kind,
    label: attribute.name,
  }
  if (attribute.deprecated === true) {
    if (constants.showDeprecatedCompletions === true) {
      completionItem.tags = [CompletionItemTag.Deprecated]
    } else {
      return undefined
    }
  }
  return completionItem
}

export const remotePluginCompletionAttributeName: RemotePlugin = api => {
  api.connectionProxy.onCompletion(
    'completion-attribute-name',
    ({ textDocument, position }) => {
      const document = api.documentsProxy.get(textDocument.uri)
      if (!document) {
        return undefined
      }
      const text = document.getText(
        Range.create(Position.create(0, 0), position)
      )
      const offset = document.offsetAt(position)
      const result = doCompletionAttributeName(text, offset)
      if (!result) {
        return undefined
      }
      const items = result.attributes
        .map(attribute =>
          createCompletionItem({ attribute, tagName: result.tagName })
        )
        .filter(Boolean) as CompletionItemWithData[]
      if (items.length === 0) {
        return undefined
      }
      return {
        isIncomplete: false,
        items,
      }
    }
  )

  api.connectionProxy.onCompletionResolve(
    'completion-attribute-name',
    params => {
      const { tagName, attributeName } = params.data as Data
      const documentation = getDocumentationForAttributeName(
        tagName,
        attributeName
      )
      params.documentation = documentation
      return params
    }
  )
}
