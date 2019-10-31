export type Reference = Readonly<{
  url: string
  name: string
}>

export type AttributeValue = Readonly<{
  description?: string
  probability?: number
  deprecated?: boolean
}>

export type Attribute = Readonly<{
  description?: string
  experimental?: boolean
  deprecated?: boolean
  reference?: Reference
  probability?: number
  type?: 'string' | 'enum'
  options?: {
    [key: string]: AttributeValue
  }
}>

export type SubTag = Readonly<{
  probability?: number
}>

export type Element = Readonly<{
  description?: string
  reference?: Reference
  selfClosing?: boolean
  newline?: boolean
  attributes?: {
    [key: string]: Attribute
  }
  allowedChildren?: {
    [tagName: string]: SubTag
  }
}>

export type Config = {
  __meta__?: unknown
  readonly globalAttributes?: {
    [key: string]: Attribute
  }
  readonly elements?: {
    [key: string]: Element
  }
}
