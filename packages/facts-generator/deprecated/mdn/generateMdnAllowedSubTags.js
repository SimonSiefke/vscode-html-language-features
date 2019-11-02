;({
  ignoreExternalFileChanges: true,
})

const fetch = require('node-fetch')
const cheerio = require('cheerio')
const fs = require('fs-extra')
const path = require('path')

const referenceUrl = tagName =>
  `https://developer.mozilla.org/en-US/docs/Web/HTML/Element/${tagName}`

async function getPermittedContent(tagName, allElements) {
  // @ts-ignore
  const html = await fetch(referenceUrl(tagName)).then(res => res.text())
  const $ = cheerio.load(html)
  /**
   * @type {'flow content'|'phrasing content'|'empty'}
   */
  let content

  if ($('table.properties tr:nth-child(2) td a:first-of-type').length === 0) {
    throw new Error('no info for ' + tagName)
  }
  const tr = $('table.properties tr:nth-child(2)')

  if (!tr.html().includes('Permitted content')) {
    throw new Error('wrong row')
  }
  const td = tr.find('td')
  const links = td
    .find('a')
    .map((index, a) => $(a).attr('href'))
    .get() //?
  const elements = links.map(link => {
    const found = allElements.find(element =>
      link.endsWith(`/Element/${element}`)
    )
    if (found) {
      return found
    }
    const isFlowContent = link.endsWith('#Flow_content')
    if (isFlowContent) {
      return {
        category: 'flow content',
      }
    }
    const isPhrasingContent = link.endsWith('#Phrasing_content')
    if (isPhrasingContent) {
      return {
        category: 'phrasing content',
      }
    }
    throw new Error('not found')
  })
  return [...elements]
  // const tds = $('table.properties tr:nth-child(2) td a:first-of-type').each(
  //   (index, element) => {
  //     const html = $(element).html() //?
  //     if (/flow/i.test(html)) {
  //       content = 'flow content'
  //     } else if (/phrasing/i.test(html)) {
  //       content = 'phrasing content'
  //     } else if (/empty/i.test(html) || /whitespace/.test(html)) {
  //       content = 'empty'
  //     } else {
  //       const links = $(element)
  //         .find('a')
  //         .get() //?
  //       throw new Error('unknown content for ' + tagName)
  //     }
  //     // const tagName = html.slice(4, -4) //?
  //     // tags.push(tagName)
  //   }
  // )
  // return content
}

// getPermittedContent('main', ['option', 'optgroup']) //?
// getPermittedContent('figure', ['option', 'optgroup', 'figcaption']) //?
getPermittedContent('span', ['option', 'optgroup', 'figcaption']) //?

const all = async () => {
  // const tags = [
  //   'main',
  //   'base',
  //   'head',
  //   'link',
  //   'meta',
  //   'style',
  //   'title',
  //   'body',
  //   'address',
  //   'article',
  //   'aside',
  //   'footer',
  //   'header',
  //   'h1',
  //   'h2',
  //   'h3',
  //   'h4',
  //   'h5',
  //   'h6',
  //   'hgroup',
  //   'main',
  //   'nav',
  //   'section',
  //   'blockquote',
  //   'dd',
  //   'dir',
  //   'div',
  //   'dl',
  //   'dt',
  //   'figcaption',
  //   'figure',
  //   'hr',
  //   'li',
  //   'main',
  //   'ol',
  //   'p',
  //   'pre',
  //   'ul',
  //   'a',
  //   'abbr',
  //   'b',
  //   'bdi',
  //   'bdo',
  //   'br',
  //   'cite',
  //   'code',
  //   'data',
  //   'dfn',
  //   'em',
  //   'i',
  //   'kbd',
  //   'mark',
  //   'q',
  //   'rb',
  //   'rp',
  //   'rt',
  //   'rtc',
  //   'ruby',
  //   's',
  //   'samp',
  //   'small',
  //   'span',
  //   'strong',
  //   'sub',
  //   'sup',
  //   'time',
  //   'tt',
  //   'u',
  //   'var',
  //   'wbr',
  //   'area',
  //   'audio',
  //   'img',
  //   'map',
  //   'track',
  //   'video',
  //   'applet',
  //   'embed',
  //   'iframe',
  //   'noembed',
  //   'object',
  //   'param',
  //   'picture',
  //   'source',
  //   'canvas',
  //   'noscript',
  //   'script',
  //   'del',
  //   'ins',
  //   'caption',
  //   'col',
  //   'colgroup',
  //   'table',
  //   'tbody',
  //   'td',
  //   'tfoot',
  //   'th',
  //   'thead',
  //   'tr',
  //   'button',
  //   'datalist',
  //   'fieldset',
  //   'form',
  //   'input',
  //   'label',
  //   'legend',
  //   'meter',
  //   'optgroup',
  //   'option',
  //   'output',
  //   'progress',
  //   'select',
  //   'textarea',
  //   'details',
  //   'dialog',
  //   'menu',
  //   'menuitem',
  //   'summary',
  // ]
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
  const processedTags = {}

  for (const tag of tags.filter(x => !tagsWithoutInfo.includes(x))) {
    const content = await getPermittedContent(tag)
    if (content !== 'empty') {
      processedTags[tag] = { allowedSubTags: [{ category: content }] }
    }
  }
  // manual overrides
  processedTags.figure = { allowedSubTags: [{ category: 'flow content' }] }
  processedTags.a = {
    allowedSubTags: [
      { category: 'flow content' },
      { category: 'phrasing content' },
    ],
  }
  processedTags.noscript = {
    allowedSubTags: [
      { category: 'flow content' },
      { category: 'phrasing content' },
    ],
  }

  fs.ensureDirSync(path.join(__dirname, '../../generated'))

  fs.writeFileSync(
    path.join(__dirname, '../../generated/mdnPermittedContent.htmlData.json'),
    `${JSON.stringify({ tags: processedTags }, null, 2)}\n`
  )
}

// all()
