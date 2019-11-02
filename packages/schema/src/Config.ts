export type Reference = Readonly<{
  url: string
  name: string
}>

export type AttributeValueInfo = Readonly<{
  description?: string
  deprecated?: boolean
  experimental?: boolean
}>

export type Snippet = string

export type AttributeInfo = Readonly<{
  description?: string
  experimental?: boolean
  deprecated?: boolean
  tags?: string[]
  reference?: Reference
  type?: 'string' | 'enum'
  options?: {
    [attributeValue: string]: AttributeValueInfo
  }
}>

export type SubTag =
  | Readonly<{
      category: string
    }>
  | string

export type ParentTag =
  | Readonly<{
      category: string
    }>
  | string

export type Tag = Readonly<{
  description?: string
  deprecated?: boolean
  reference?: Reference
  selfClosing?: boolean
  newline?: boolean
  categories?: string[]
  attributes?: {
    [attributeName: string]: AttributeInfo
  }
  allowedSubTags?: SubTag[]
  allowedParentTags?: ParentTag[]
  disallowedParentTags?: ParentTag[]
}>

export type Config = {
  __meta__?: unknown
  readonly globalAttributes?: {
    readonly [key: string]: AttributeInfo
  }
  readonly tags?: {
    readonly [key: string]: Tag
  }
  readonly snippets?: {
    readonly [key: string]: Snippet
  }
}
