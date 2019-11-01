;({
  ignoreExternalFileChanges: true,
})

const fetch = require('node-fetch')
const cheerio = require('cheerio')
const fs = require('fs')
const path = require('path')

const referenceUrl = tagName =>
  `https://developer.mozilla.org/en-US/docs/Web/HTML/Element/${tagName}`

async function getPermittedContent(tagName) {
  // @ts-ignore
  const html = await fetch(referenceUrl(tagName)).then(res => res.text())
  const $ = cheerio.load(html)
  let content

  if ($('table.properties tr:nth-child(2) td a:first-of-type').length === 0) {
    throw new Error('no info for ' + tagName)
  }
  $('table.properties tr:nth-child(2) td a:first-of-type').each(
    (index, element) => {
      const html = $(element).html() //?
      if (html === 'Flow content') {
        content = 'flow content'
      } else if (html === 'Phrasing content') {
        content = 'phrasing content'
      } else if (html === 'empty element' || html === 'whitespace') {
        content = 'empty'
      } else {
        throw new Error('unknown content for ' + tagName)
      }
      // const tagName = html.slice(4, -4) //?
      // tags.push(tagName)
    }
  )
  return content
}

;(async () => {
  const tags = [
    'main',
    'base',
    'head',
    'link',
    'meta',
    'style',
    'title',
    'body',
    'address',
    'article',
    'aside',
    'footer',
    'header',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'hgroup',
    'main',
    'nav',
    'section',
    'blockquote',
    'dd',
    'dir',
    'div',
    'dl',
    'dt',
    'figcaption',
    'figure',
    'hr',
    'li',
    'main',
    'ol',
    'p',
    'pre',
    'ul',
    'a',
    'abbr',
    'b',
    'bdi',
    'bdo',
    'br',
    'cite',
    'code',
    'data',
    'dfn',
    'em',
    'i',
    'kbd',
    'mark',
    'q',
    'rb',
    'rp',
    'rt',
    'rtc',
    'ruby',
    's',
    'samp',
    'small',
    'span',
    'strong',
    'sub',
    'sup',
    'time',
    'tt',
    'u',
    'var',
    'wbr',
    'area',
    'audio',
    'img',
    'map',
    'track',
    'video',
    'applet',
    'embed',
    'iframe',
    'noembed',
    'object',
    'param',
    'picture',
    'source',
    'canvas',
    'noscript',
    'script',
    'del',
    'ins',
    'caption',
    'col',
    'colgroup',
    'table',
    'tbody',
    'td',
    'tfoot',
    'th',
    'thead',
    'tr',
    'button',
    'datalist',
    'fieldset',
    'form',
    'input',
    'label',
    'legend',
    'meter',
    'optgroup',
    'option',
    'output',
    'progress',
    'select',
    'textarea',
    'details',
    'dialog',
    'menu',
    'menuitem',
    'summary',
  ]
  /**
   * can't extract info about these because the mdn description is written in text for humans
   */
  const tagsWithoutInfo = [
    'head',
    'hgroup',
    'dl',
    'figure',
    'ol',
    'ul',
    'a',
    'rb',
    'audio',
    'map',
    'video',
    'applet',
    'object',
    'picture',
    'canvas',
    'noscript',
    'del',
    'ins',
    'colgroup',
    'table',
    'tbody',
    'tfoot',
    'thead',
    'tr',
    'datalist',
    'fieldset',
    'optgroup',
    'select',
    'details',
    'menu',
    'style',
    'dir',
    'rp',
    'wbr',
    'iframe',
    'noembed',
    'script',
    'option',
    'textarea',
    'summary',
  ]
  const precessedTags = {}

  for (const tag of tags.filter(x => !tagsWithoutInfo.includes(x))) {
    const content = await getPermittedContent(tag)
    if (content !== 'empty') {
      precessedTags[tag] = { allowedChildren: [{ category: content }] }
    }
  }
  // manual overrides
  precessedTags.figure = { allowedChildren: [{ category: 'flow content' }] }
  precessedTags.a = {
    allowedChildren: [
      { category: 'flow content' },
      { category: 'phrasing content' },
    ],
  }
  precessedTags.noscript = {
    allowedChildren: [
      { category: 'flow content' },
      { category: 'phrasing content' },
    ],
  }

  fs.writeFileSync(
    path.join(
      __dirname,
      '../src/configs/generated/permittedContent.htmlData.json'
    ),
    `${JSON.stringify({ tags: precessedTags }, null, 2)}\n`
  )
})()
