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
 * @return {Promise<{linkType:string, description:string, deprecated:boolean, experimental:boolean, allowedTags:string[], notAllowedTags:string[]}[], >}}>}
 */
const getLinkTypes = async () => {
  const fullUrl = 'https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types'
  // @ts-ignore
  const html = await fetch(fullUrl).then(res => res.text())
  // @ts-ignore
  const $ = cheerio.load(html)
  const table = $('#wikiArticle table').first()
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
          .html() !== null
      const experimental =
        $(tds[0])
          .find('.icon-beaker')
          .html() !== null
      const description = $(tds[1]).html()
      const allowedTags = $(tds[2])
        .map((index, td) =>
          $(td)
            .find('code')
            .map((index, code) =>
              $(code)
                .html()
                .slice(4, -4)
            )
            .get()
        )
        .get() //?

      const notAllowedTags = $(tds[3])
        .map((index, td) =>
          $(td)
            .find('code')
            .map((index, code) =>
              $(code)
                .html()
                .slice(4, -4)
            )
            .get()
        )
        .get() //?

      if (linkType === null) {
        $(tr).html() //?
        throw new Error('invalid link type')
      }
      console.log(linkType)
      return {
        linkType,
        description,
        deprecated,
        experimental,
        allowedTags,
        notAllowedTags,
      }
    })
    .get()
}

const getTags = async () => {
  const linkTypes = await getLinkTypes() //?

  const fixDescriptionMarkdown = description => {
    if (!description) {
      return undefined
    }
    // @ts-ignore
    return turndownService.turndown(description)
  }

  const tags = {}
  for (const linkType of linkTypes) {
    for (const tag of linkType.allowedTags.filter(
      tag => !linkType.notAllowedTags.includes(tag)
    )) {
      tags[tag] = tags[tag] || {}
      tags[tag].attributes = tags[tag].attributes || {}
      tags[tag].attributes['rel'] = tags[tag].attributes['rel'] || {}
      tags[tag].attributes['rel'].options =
        tags[tag].attributes['rel'].options || {}
      tags[tag].attributes['rel'].options[linkType.linkType] = {
        description: fixDescriptionMarkdown(linkType.description),
        deprecated: linkType.deprecated,
        experimental: linkType.experimental,
      }
    }
  }

  // TODO filter by what exactly is allowed on link, a, area etc
  // const tags = {
  //   a: {
  //     attributes: {
  //       rel: {
  //         options,
  //       },
  //     },
  //   },
  //   link: {
  //     attributes: {
  //       rel: {
  //         options,
  //       },
  //     },
  //   },
  // }
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
