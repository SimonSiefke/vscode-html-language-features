import * as vscode from 'vscode'

/**
 * When do we want an indent? (explaining the regex)
 *
 * 1. when the tag not a self closing tag (like input) or it has the xml syntax for self-closing (e.g. <button />)
 * 2. and the tag is not closed (e.g. <div>)
 * 3. and there is no open starting comment
 *
 * <  ### begin html tag
 *   (
 *     ?!  ### negative lookbehind
 *       (?:area|base|br|col|frame|hr|html|img|input)\b  ### any self closing tag (inside a non-captured group for performance)
 *       | ### or
 *       [^>]*\/>  ### any tag that ends with "/>", e.g. "<input />"
 *   )
 *   ([-_\.A-Za-z0-9]+)  ### html tag name (in a capture group)
 *   (?=>)\b  ### lookahead for end of starting tag
 *   [^>]* ### anything except for end of starting tag
 *   >  ### end of starting tag
 *   (?!.*<\/\1>)  ### no matching closing tag
 *   |  ### or
 *   <!--(?!.*-->)   ### start comment and no close comment
 *   $  ### end of line
 */
const increaseIndentPattern = /<(?!(?:area|base|br|col|frame|hr|html|img|input|link|meta|param)\b|[^>]*\/>)([-_\.A-Za-z0-9]+)(?=>)\b[^>]*>(?!.*<\/\1>)|<!--(?!.*-->)$/
/**
 * When do we want to decrease indent? (explaining the regex)
 *
 * ^\s*  ### line starts with whitespace
 *   <\/[-_.A-Za-z0-9]+\b[^>]*>  ### closing tag
 *   |  ### or
 *   -->  ### closing comment
 */
const decreaseIndentPattern = /^\s*<\/[-_.A-Za-z0-9]+\b[^>]*>|-->/

/**
 * TODO haven't figured out yet what this does
 */
const wordPattern = /(-?\d*\.\d\w*)|([^`~!@$^&*()=+[{]}\\\|;:'",\.<>\/\s]+)/g

const htmlLanguageConfiguration: vscode.LanguageConfiguration = {
  indentationRules: {
    increaseIndentPattern,
    decreaseIndentPattern,
  },
  onEnterRules: [
    {
      /**
       * When do we want to indent? (explaining the regex)
       *
       * We want to indent when the cursor is between 2 tags.
       * E.g. we want to indent "<div>|</div>" to "<div>\n\t\n</div>" when enter is pressed
       *
       * This beforeText regex is for the end of the start of an html tag
       * E.g. it matches "<div>|" but not "<div>text|"
       *
       * <  ### begin html tag
       * (?!(?:area))  ## no void elements
       * ()
       * [^/>]*  ### everything until end of tag
       * (?!\/)  ### negative lookahead for "/" (to verify that its a starting tag and not an ending tag)
       * >  ### end of the start tag
       * [^<]*  ### not another tag
       * $  ### end of beforeText
       */
      beforeText: /<(?!(?:area|base|br|input|meta|hr|img|link))([_:\w][_:\w-.\d]*)([^/>]*(?!\/)>)[^<]*$/i,
      /**
       * When do we want to indent? (explaining the regex)
       *
       * This afterText regex is for the start of the end of an html tag
       * E.g. it matches "|</div>" but not "|text</div>text"
       *
       * ^<\/  ### start with closing html tag
       * [^>]*  ### everything until end of tag
       * >  ### end of closing html tag
       */
      afterText: /^<\/[^>]*>/i,
      action: { indentAction: vscode.IndentAction.IndentOutdent },
    },
    {
      /**
       * When do we want to indent? (explaining the regex)
       *
       * We want to indent when the cursor is at the end of a starting html tag (that is not void)
       * E.g. we want to indent "<div>|</div>" but not "</div>|</body>"
       *
       * <  ### begin html tag
       * (?!(?:area))  ## no void elements
       * [^/>]*  ### everything until end of tag
       * (?!\/)  ### negative lookahead for "/" (to verify that its a starting tag and not an ending tag)
       * >  ### end of the start tag
       * [^<]*$  ### not another tag
       *
       */
      beforeText: /<(?!(?:area|base|br|input|meta|hr|img|link))\w[^/>]*(?!\/)>[^<]*$/i,
      action: { indentAction: vscode.IndentAction.Indent },
    },
  ],
  wordPattern,
}

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.languages.setLanguageConfiguration('html', htmlLanguageConfiguration)
  )
}
