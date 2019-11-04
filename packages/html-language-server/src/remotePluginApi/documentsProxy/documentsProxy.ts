import { TextDocuments } from 'vscode-languageserver'

/**
 * Wrapper around `documents`
 */
export interface DocumentsProxy {
  readonly get: TextDocuments['get']
}

export const createDocumentsProxy: (
  documents: TextDocuments
) => DocumentsProxy = documents => documents
