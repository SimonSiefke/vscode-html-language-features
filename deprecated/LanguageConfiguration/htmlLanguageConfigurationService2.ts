// // import * as vscode from 'vscode'
// // import { Service } from '../../types'

// export const decreaseIndentPatternOriginal = /^\s*(<\/(?!html)[-_\.A-Za-z0-9]+\b[^>]*>|-->|\})/
// export const increaseIndentPatternOriginal = /<(?!\?|(?:area|base|br|col|frame|hr|html|img|input|link|meta|param)\b|[^>]*\/>)([-_\.A-Za-z0-9]+)(?=\s|>)\b[^>]*>(?!.*<\/\1>)|<!--(?!.*-->)|\{[^}"']*$/
// // function activate() {
// //   vscode.languages.setLanguageConfiguration('html', {
// //     indentationRules: {
// //       increaseIndentPattern: /<(?!\?|(?:area|base|br|col|frame|hr|html|img|input|link|meta|param)\b|[^>]*\/>)([-_\.A-Za-z0-9]+)(?=\s|>)\b[^>]*>(?!.*<\/\1>)|<!--(?!.*-->)|\{[^}"']*$/,
// //       decreaseIndentPattern: /^\s*(<\/(?!html)[-_\.A-Za-z0-9]+\b[^>]*>|-->|\})/,
// //     },
// //     wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\$\^\&\*\(\)\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\s]+)/g,
// //     onEnterRules: [
// //       {
// //         beforeText: new RegExp(
// //           `<(?!(?:${[].join('|')}))([_:\\w][_:\\w-.\\d]*)([^/>]*(?!/)>)[^<]*$`,
// //           'i'
// //         ),
// //         afterText: /^<\/([_:\w][_:\w-.\d]*)\s*>/i,
// //         action: { indentAction: vscode.IndentAction.IndentOutdent },
// //       },
// //       {
// //         beforeText: new RegExp(
// //           `<(?!(?:${[].join('|')}))(\\w[\\w\\d]*)([^/>]*(?!/)>)[^<]*$`,
// //           'i'
// //         ),
// //         action: { indentAction: vscode.IndentAction.Indent },
// //       },
// //     ],
// //   })
// // }

// // export const htmlLanguageConfigurationService2: Service = {
// //   activate,
// // }
