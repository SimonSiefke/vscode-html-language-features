import {
  CompletionList,
  Connection,
  ResponseError,
  ErrorCodes,
  CompletionParams,
  CompletionItem,
  TextDocumentPositionParams,
  SignatureHelp,
  Hover,
  CancellationToken,
  RequestType,
  // @ts-ignore
} from 'vscode-languageserver'

const cancelValue = new ResponseError<any>(
  ErrorCodes.RequestCancelled,
  'Request cancelled'
)

const enum ErrorMessages {
  onHover = 'onHover Error',
  onCompletion = 'onCompletion Error',
  onCompletionResolveError = 'onCompletionResolve Error',
  onSignatureHelpError = 'onSignatureHelp Error',
  onRequest = 'onRequest Error',
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
   * @param handler The corresponding handler.
   */
  onCompletion: RequestHandler<
    CompletionParams,
    CompletionItem[] | CompletionList | undefined
  >
  /**
   * Installs a handler for the `CompletionResolve` request.
   *
   * @param handler The corresponding handler.
   */
  onCompletionResolve: RequestHandler<CompletionItem, CompletionItem>
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
  return {
    onHover(handler) {
      connection.onHover(runSafe(handler, ErrorMessages.onHover, 'onHover'))
    },
    onCompletion(handler) {
      connection.onCompletion(
        runSafe(handler, ErrorMessages.onCompletion, 'onCompletion')
      )
    },
    onCompletionResolve(handler) {
      connection.onCompletionResolve(
        runSafe(
          handler,
          ErrorMessages.onCompletionResolveError,
          'onCompletionResolve'
        )
      )
    },
    onSignatureHelp(handler) {
      connection.onSignatureHelp(
        runSafe(handler, ErrorMessages.onSignatureHelpError, 'onSignatureHelp')
      )
    },
    onRequest(requestType, handler) {
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
