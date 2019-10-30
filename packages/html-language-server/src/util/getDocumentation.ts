import { MarkupKind } from 'vscode-languageserver'
import {
  getDescriptionForTag,
  getReferenceForTag,
  getDescriptionForAttributeName,
  getReferenceForAttributeName,
} from '@html-language-features/html-language-service'
import { Reference } from '@html-language-features/schema'

interface Documentation {
  kind: typeof MarkupKind.Markdown
  value: string
}

const withReference: (
  description: string,
  reference: Reference | undefined
) => Documentation = (description, reference) => {
  let finalDescription = description
  if (reference) {
    finalDescription = `${finalDescription}\n\n[${reference.name}](${reference.url})`
  }
  return {
    kind: MarkupKind.Markdown,
    value: finalDescription,
  }
}
export const getDocumentationForTagName: (
  tagName: string
) => Documentation | undefined = tagName => {
  const description = getDescriptionForTag(tagName)
  if (!description) {
    return undefined
  }
  const reference = getReferenceForTag(tagName)
  return withReference(description, reference)
}

export const getDocumentationForAttributeName: (
  tagName: string | undefined,
  attributeName: string
) => Documentation | undefined = (tagName, attributeName) => {
  const description = getDescriptionForAttributeName(tagName, attributeName)
  if (!description) {
    return undefined
  }
  const reference = getReferenceForAttributeName(tagName, attributeName)
  return withReference(description, reference)
}
