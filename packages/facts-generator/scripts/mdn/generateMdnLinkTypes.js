const fetch = require('node-fetch')
const cheerio = require('cheerio')
const fs = require('fs-extra')
const path = require('path')
var TurndownService = require('turndown')
var turndownService = new TurndownService({})

turndownService.addRule('remove', {
  filter: ['a', 'h1', 'code', 'pre', 'strong', 'i', 'em'],
  replacement: function(content, x) {
    return content
    // return 'blob' + content
  },
})

/**
 *
 * @return {Promise<{linkType:string, description:string, deprecated:boolean, experimental:boolean}[]>}}>}
 */
const getLinkTypes = async () => {
  const fullUrl = 'https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types'
  // @ts-ignore
  const html = await fetch(fullUrl).then(res => res.text())
  // @ts-ignore
  const $ = cheerio.load(html)
  const table = $('#wikiArticle table')
  const trs = table.find('tbody tr')

  // @ts-ignore
  return trs
    .map((index, tr) => {
      const tds = $(tr).find('td')
      const linkType = $(tds[0])
        .find('code')
        .html()
      const deprecated =
        $(tds[0])
          .find('.icon-trash')
          .html() !== null //?
      const experimental =
        $(tds[0])
          .find('.icon-beaker')
          .html() !== null
      const description = $(tds[1]).html()
      return {
        linkType,
        description,
        deprecated,
        experimental,
      }
    })
    .get()
}

const getTags = async () => {
  const linkTypes = await getLinkTypes()

  const fixDescriptionMarkdown = description => {
    if (!description) {
      return undefined
    }
    // @ts-ignore
    return turndownService.turndown(description)
  }

  const options = {}
  for (const linkType of linkTypes) {
    options[linkType.linkType] = {
      description: fixDescriptionMarkdown(linkType.description),
      deprecated: linkType.deprecated,
      experimental: linkType.experimental,
    }
  }

  // TODO filter by what exactly is allowed on link, a, area etc
  const tags = {
    a: {
      attributes: {
        rel: {
          options,
        },
      },
    },
    link: {
      attributes: {
        rel: {
          options,
        },
      },
    },
  }
  return tags
}

const all = async () => {
  const tags = await getTags()
  fs.ensureDirSync(path.join(__dirname, '../../generated'))
  fs.writeFileSync(
    path.join(__dirname, '../../generated/mdnLinkTypes.htmlData.json'),
    `${JSON.stringify({ tags }, null, 2)}\n`
  )
}

all()
