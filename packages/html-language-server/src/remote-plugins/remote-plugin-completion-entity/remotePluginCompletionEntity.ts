import * as entities from '@html-language-features/facts-generator/generated/whatwgEntities.json'
import { doCompletionEntity } from '@html-language-features/html-language-service'
import {
  CompletionItem,
  CompletionItemKind,
  Position,
  Range,
  TextEdit,
} from 'vscode-languageserver'
import { RemotePlugin } from '../remotePlugin'

const linesIcon = CompletionItemKind.Keyword

const createCompletionItem: (
  entity: string,
  char: string,
  range: Range
) => CompletionItem = (entity, char, range) => {
  const label = `&${entity};`
  return {
    detail: char,
    kind: linesIcon,
    label,
    textEdit: TextEdit.replace(range, label),
  }
}

export const remotePluginCompletionEntity: RemotePlugin = api => {
  api.connectionProxy.onCompletion(
    'completion-entity',
    ({ textDocument, position }) => {
      const document = api.documentsProxy.get(textDocument.uri)
      if (!document) {
        return undefined
      }
      const text = document.getText()
      const offset = document.offsetAt(position)
      const results = doCompletionEntity(text, offset, entities)
      const range = Range.create(
        Position.create(position.line, position.character - 1),
        position
      )
      const items: CompletionItem[] = results.map(result =>
        createCompletionItem(
          result,
          entities[result as keyof typeof entities],
          range
        )
      )
      if (items.length === 0) {
        return undefined
      }
      return {
        isIncomplete: false,
        items,
      }
    }
  )
  api.connectionProxy.onCompletionResolve('completion-entity', params => params)
}
