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
  reference?: Reference
  // TODO validation property
  // validation:{
  //    type: integer,
  //    min: 0,
  //    max: 2
  // }
  // or
  // attributeValues
  //
  type?: 'string' | 'enum' | 'color' | 'integer' | 'number' | 'string'
  options?: {
    [attributeValue: string]: AttributeValueInfo
  }
}>

export type Category =
  | 'flow content'
  | 'phrasing content'
  | 'interactive content'
  | 'listed content'
  | 'labelable'
  | 'submittable content'
  | 'form-associated content'
  | 'palpable content'
  | 'sectioning root content'
  | 'sectioning content'
  | 'embedded content'
  | 'metadata content'
  | 'heading'
  | 'script-supporting'
  | 'resettable'

export type SubTag =
  | Readonly<{
      category: Category
    }>
  | string

export type Tag = Readonly<{
  description?: string
  deprecated?: boolean
  reference?: Reference
  selfClosing?: boolean
  newline?: boolean
  categories?: Category[]
  attributes?: {
    [attributeName: string]: AttributeInfo
  }
  allowedParentTags?: string[]
  allowedSubTags?: SubTag[]
  deepDisallowedSubTags?: SubTag[]
}>

export type Config = {
  __meta__?: unknown
  readonly globalAttributes?: {
    readonly [key: string]: AttributeInfo
  }
  readonly tags?: {
    readonly [tagName: string]: Tag
  }
}
