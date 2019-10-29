export interface Reference {
  url: string
  name: string
}

export interface Attribute {
  description?: string
  experimental?: boolean
  deprecated?: boolean
  reference?: Reference
  probability?: number
}

export interface Element {
  description?: string
  reference?: Reference
  selfClosing?: boolean
  newline?: boolean
  attributes?: {
    [key: string]: Attribute
  }
  allowedChildren?: {
    [tagName: string]: {
      probability?: number
    }
  }
}

export interface Config {
  __meta__?: unknown
  elements?: {
    [key: string]: Element
  }
}
