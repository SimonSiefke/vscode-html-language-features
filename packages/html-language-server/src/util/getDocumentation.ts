import {
  getDescriptionForAttributeName,
  getDescriptionForAttributeValue,
  getDescriptionForTag,
  getReferenceForAttributeName,
  getReferenceForTag,
  Reference,
} from '@html-language-features/html-language-service'
import { MarkupKind } from 'vscode-languageserver-types'

interface Documentation {
  kind: typeof MarkupKind.Markdown
  value: string
}

const withReference: (
  description: string | undefined,
  reference: Reference | undefined
) => Documentation | undefined = (description, reference) => {
  if (!description) {
    return undefined
  }
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
  const reference = getReferenceForTag(tagName)
  return withReference(description, reference)
}

export const getDocumentationForAttributeName: (
  tagName: string,
  attributeName: string
) => Documentation | undefined = (tagName, attributeName) => {
  const description = getDescriptionForAttributeName(tagName, attributeName)
  const reference = getReferenceForAttributeName(tagName, attributeName)
  return withReference(description, reference)
}

export const getDocumentationForAttributeValue: (
  tagName: string,
  attributeName: string,
  attributeValue: string
) => Documentation | undefined = (tagName, attributeName, attributeValue) => {
  const description = getDescriptionForAttributeValue(
    tagName,
    attributeName,
    attributeValue
  )
  const reference = getReferenceForAttributeName(tagName, attributeName)
  return withReference(description, reference)
}
