import { MarkupKind } from 'vscode-languageserver'
import {
  getInfoDescriptionForHtmlTag,
  getInfoReference,
} from '@html-language-features/html-language-service'

export const getDocumentationForTagName: (
  tagName: string
) =>
  | { kind: typeof MarkupKind.Markdown; value: string }
  | undefined = tagName => {
  const description = getInfoDescriptionForHtmlTag(tagName)
  if (!description) {
    return undefined
  }
  let finalDescription = description
  const reference = getInfoReference(tagName)
  if (reference) {
    finalDescription = `${finalDescription}\n\n[${reference.name}](${reference.url})`
  }
  return {
    kind: MarkupKind.Markdown,
    value: finalDescription,
  }
}
