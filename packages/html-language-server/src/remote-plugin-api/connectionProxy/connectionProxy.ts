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
  onCompletionResolve = 'onCompletionResolve Error',
  onSignatureHelp = 'onSignatureHelp Error',
  onRequest = 'onRequest Error',
  onDocumentSymbol = 'onDocumentSymbol Error',
  onDidChangeConfiguration = 'onDidChangeConfiguration Error',
}

type RequestHandler<Params, Result> = (
  handler: (params: Params) => Result
) => void

/**
 * Wrapper around `connection`
 */
export interface ConnectionProxy {
  /**
   * Installs a handler for the `Hover` request.
   *
   * @param handler The corresponding handler.
   */
  readonly onHover: RequestHandler<
    TextDocumentPositionParams,
    Hover | undefined
  >
  /**
   * Installs a handler for the `Completion` request.
   *
   * @param id - Unique identifier of the corresponding handler
   * @param handler - The corresponding handler.
   */
  readonly onCompletion: (
    id: string,
    handler: (params: CompletionParams) => CompletionList | undefined
  ) => void

  /**
   * Installs a handler for the `CompletionResolve` request.
   *
   * @param handler The corresponding handler.
   */
  readonly onCompletionResolve: (
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
  readonly onSignatureHelp: RequestHandler<
    TextDocumentPositionParams,
    SignatureHelp | undefined
  >
  /**
   * Installs a handler for the `onDocumentSymbol` request.
   *
   * @param handler The corresponding handler.
   */
  readonly onDocumentSymbol: RequestHandler<
    TextDocumentPositionParams,
    DocumentSymbol[] | undefined
  >
  /**
   * Installs a request handler described by the given [RequestType](#RequestType).
   *
   * @param type The [RequestType](#RequestType) describing the request.
   * @param handler The handler to install
   */
  readonly onRequest: <Params, Result>(
    requestType: RequestType<Params, Result, any, any>,
    handler: (params: Params) => Result | Promise<Result>
  ) => void
}

const measure = false

/**
 * Runs a handler
 */
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
      // console.log('canceled')
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
    [id: string]: (params: CompletionParams) => CompletionList | undefined
  } = {}
  const onCompletionResolverHandlers: {
    [id: string]: (params: CompletionItem) => CompletionItem
  } = {}
  // const onSignatureHelpHandlers: any[] = []
  // const onRequestHandlers: any[] = []
  return {
    workspace: connection.workspace,
    onDocumentSymbol: handler => {
      connection.onDocumentSymbol(
        runSafe(handler, ErrorMessages.onDocumentSymbol, 'onDocumentSymbol')
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
              console.log('on')
              for (const [id, onCompletionHandler] of Object.entries(
                onCompletionHandlers
              )) {
                const result = onCompletionHandler(params)
                if (!result) {
                  console.log('none' + id)
                  continue
                }
                console.log('some' + id)
                for (const item of result.items) {
                  item.data = {
                    id,
                    data: item.data,
                  }
                }
                return result
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
            ErrorMessages.onCompletionResolve,
            'onCompletionResolve'
          )
        )
      }
      onCompletionResolverHandlers[id] = handler
    },
    onSignatureHelp: handler => {
      connection.onSignatureHelp(
        runSafe(handler, ErrorMessages.onSignatureHelp, 'onSignatureHelp')
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
