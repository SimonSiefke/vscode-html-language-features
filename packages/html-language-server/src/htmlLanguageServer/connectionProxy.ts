import {
  CompletionList,
  CompletionItem,
  SignatureHelp,
  Hover,
  DocumentSymbol,
} from 'vscode-languageserver-types'
import {
  ResponseError,
  ErrorCodes,
  TextDocumentPositionParams,
  CompletionParams,
  RequestType,
  CancellationToken,
  Connection,
} from 'vscode-languageserver'

const cancelValue = new ResponseError<undefined>(
  ErrorCodes.RequestCancelled,
  'Request cancelled'
)

const enum ErrorMessages {
  onHover = 'onHover Error',
  onCompletion = 'onCompletion Error',
  onCompletionResolveError = 'onCompletionResolve Error',
  onSignatureHelpError = 'onSignatureHelp Error',
  onRequest = 'onRequest Error',
  onDocumentSymbolError = 'onDocumentSymbol Error',
}

type RequestHandler<Params, Result> = (
  handler: (params: Params) => Result
) => void

export interface ConnectionProxy {
  /**
   * Installs a handler for the `Hover` request.
   *
   * @param handler The corresponding handler.
   */
  onHover: RequestHandler<TextDocumentPositionParams, Hover | undefined>
  /**
   * Installs a handler for the `Completion` request.
   *
   * @param id - Unique identifier of the corresponding handler
   * @param handler - The corresponding handler.
   */
  onCompletion: (
    id: string,
    handler: (params: CompletionParams) => CompletionItem[] | undefined
  ) => void

  /**
   * Installs a handler for the `CompletionResolve` request.
   *
   * @param handler The corresponding handler.
   */
  onCompletionResolve: (
    id: string,
    handler: (
      params: CompletionItem & {
        readonly label: CompletionItem['label']
        readonly kind?: CompletionItem['kind']
        readonly tags?: CompletionItem['tags']
        readonly detail?: CompletionItem['detail']
        documentation?: CompletionItem['documentation']
        readonly sortText?: CompletionItem['sortText']
        readonly filterText?: CompletionItem['filterText']
        readonly insertText?: CompletionItem['insertText']
        readonly insertTextFormat?: CompletionItem['insertTextFormat']
        readonly textEdit?: CompletionItem['textEdit']
        readonly additionalTextEdits?: CompletionItem['additionalTextEdits']
        readonly commitCharacters?: CompletionItem['commitCharacters']
        readonly command?: CompletionItem['command']
        readonly data?: CompletionItem['data']
      }
    ) => CompletionItem
  ) => void
  /**
   * Installs a handler for the `SignatureHelp` request.
   *
   * @param handler The corresponding handler.
   */
  onSignatureHelp: RequestHandler<
    TextDocumentPositionParams,
    SignatureHelp | undefined
  >
  /**
   * Installs a handler for the `onDocumentSymbol` request.
   *
   * @param handler The corresponding handler.
   */
  onDocumentSymbol: RequestHandler<
    TextDocumentPositionParams,
    DocumentSymbol[] | undefined
  >
  /**
   * Installs a request handler described by the given [RequestType](#RequestType).
   *
   * @param type The [RequestType](#RequestType) describing the request.
   * @param handler The handler to install
   */
  onRequest: <Params, Result>(
    requestType: RequestType<Params, Result, any, any>,
    handler: (params: Params) => Result | Promise<Result>
  ) => void
}

const measure = false

const runSafe: <Handler extends (...args: any) => any>(
  handler: Handler,
  errorMessage: string,
  handlerName?: string
) => (
  params: any,
  token: CancellationToken
) =>
  | ReturnType<Handler>
  | Promise<ReturnType<Handler>>
  | ResponseError<any>
  | Promise<ResponseError<any>> = (
  handler,
  errorMessage,
  handlerName = 'handler'
) => async (params, token) => {
  try {
    const NS_PER_MS = 1e6
    const NS_PER_SEC = 1e9
    const start = process.hrtime()
    const result = await handler(params)
    const elapsedTime = process.hrtime(start)
    const elapsedTimeMs =
      (elapsedTime[0] * NS_PER_SEC + elapsedTime[1]) / NS_PER_MS
    if (measure) {
      console.log(`${handlerName} took: ${elapsedTimeMs}ms`)
    }
    const maxAllowedTime = 1.35
    if (true && elapsedTimeMs > maxAllowedTime && measure) {
      console.error(`${handlerName} took: ${elapsedTimeMs}ms`)
    }
    if (token.isCancellationRequested) {
      console.error('canceled')
      return cancelValue
    }
    return result
  } catch (error) {
    console.error(errorMessage)
    console.error(error.stack)
    return undefined
  }
}

export const createConnectionProxy: (
  connection: Connection
) => ConnectionProxy = connection => {
  const onHoverHandlers: any[] = []
  const onCompletionHandlers: {
    [id: string]: (params: CompletionParams) => CompletionItem[] | undefined
  } = {}
  const onCompletionResolverHandlers: {
    [id: string]: (params: CompletionItem) => CompletionItem
  } = {}
  const onSignatureHelpHandlers: any[] = []
  const onRequestHandlers: any[] = []
  return {
    onDocumentSymbol: handler => {
      connection.onDocumentSymbol(
        runSafe(
          handler,
          ErrorMessages.onDocumentSymbolError,
          'onDocumentSymbol'
        )
      )
    },
    onHover: handler => {
      onHoverHandlers.push(handler)
      if (onHoverHandlers.length === 1) {
        connection.onHover(
          runSafe(
            (...args) => {
              for (const hoverHandler of onHoverHandlers) {
                const result = hoverHandler(...args)
                if (result) {
                  return result
                }
              }
              return undefined
            },
            ErrorMessages.onHover,
            'onHover'
          )
        )
      }
    },
    onCompletion: (id, handler) => {
      if (Object.keys(onCompletionHandlers).length === 0) {
        connection.onCompletion(
          runSafe(
            params => {
              for (const [id, onCompletionHandler] of Object.entries(
                onCompletionHandlers
              )) {
                const result = onCompletionHandler(params)
                if (result) {
                  for (const item of result) {
                    item.data = {
                      id,
                      data: item.data,
                    }
                  }
                  return result
                }
              }
              return undefined
            },
            ErrorMessages.onCompletion,
            'onCompletion'
          )
        )
      }
      onCompletionHandlers[id] = handler
    },
    onCompletionResolve: (id, handler) => {
      if (Object.keys(onCompletionResolverHandlers).length === 0) {
        connection.onCompletionResolve(
          runSafe(
            params => {
              const handler = onCompletionResolverHandlers[params.data.id]
              if (!handler) {
                throw new Error('no handler registered')
              }
              params.data = params.data.data
              return handler(params)
            },
            ErrorMessages.onCompletionResolveError,
            'onCompletionResolve'
          )
        )
      }
      onCompletionResolverHandlers[id] = handler
    },
    onSignatureHelp: handler => {
      connection.onSignatureHelp(
        runSafe(handler, ErrorMessages.onSignatureHelpError, 'onSignatureHelp')
      )
    },
    onRequest: (requestType, handler) => {
      connection.onRequest(
        requestType,
        runSafe(
          handler,
          ErrorMessages.onRequest,
          `onRequest: ${requestType.method}`
        )
      )
    },
  }
}
