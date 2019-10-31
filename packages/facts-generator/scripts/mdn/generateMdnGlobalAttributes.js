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

const reference =
  'https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes'

/** @typedef {{name:string, description:string, link:string, deprecated:boolean, experimental:boolean} } PreAttribute */

/**
 * @return {Promise<PreAttribute[]>}
 */
const getGlobalAttributes = async () => {
  // @ts-ignore
  const html = await fetch(reference).then(res => res.text())
  // @ts-ignore
  const $ = cheerio.load(html) //?

  const definitionList = $('#wikiArticle dl')
  const dts = definitionList.find('dt')
  const links = dts
    .map((index, dt) =>
      $(dt)
        .find('a')
        .attr('href')
    )
    .get() //?
  const attributeNames = dts
    .map((index, dt) =>
      $(dt)
        .find('code')
        .html()
    )
    .get() //?

  const experimentalAttributes = dts
    .map(
      (index, dt) =>
        $(dt)
          .find('i[class="icon-beaker"]')
          .html() || 'no'
    )
    .get()
    .map(x => x !== 'no')
  const deprecatedAttributes = dts
    .map(
      (index, dt) =>
        $(dt)
          .find('i[class="icon-trash"]')
          .html() || 'no'
    )
    .get()
    .map(x => x !== 'no')

  const dds = definitionList.find('dd')
  const descriptions = dds.map((index, dd) => $(dd).html()).get()

  const results = []
  for (let i = 0; i < links.length; i++) {
    const link = links[i]
    const name = attributeNames[i]
    const description = descriptions[i]
    const experimental = experimentalAttributes[i]
    const deprecated = deprecatedAttributes[i]
    results.push({
      name,
      description,
      link,
      experimental,
      deprecated,
    })
  }
  return results
}

// getGlobalAttributes() //?

const fixDescriptionMarkdown = description => {
  if (!description) {
    return undefined
  }
  // @ts-ignore
  return turndownService.turndown(description)
}

/**
 *
 * @param {PreAttribute[]} attributes
 * @return {any}
 */
const finishAttributes = attributes => {
  const globalAttributes = {}
  for (const attribute of attributes) {
    globalAttributes[attribute.name] = {}
    const current = globalAttributes[attribute.name]
    if (attribute.deprecated) {
      current.deprecated = true
    }
    if (attribute.experimental) {
      current.experimental = true
    }
    current.description = fixDescriptionMarkdown(attribute.description)
    current.reference = {
      name: 'MDN Reference',
      url: 'https://developer.mozilla.org' + attribute.link,
    }
  }
  return globalAttributes
}

const all = async () => {
  const preAttributes = await getGlobalAttributes()
  const globalAttributes = finishAttributes(preAttributes)
  fs.ensureDirSync(path.join(__dirname, '../../generated'))
  fs.writeFileSync(
    path.join(__dirname, '../../generated/mdnGlobalAttributes.htmlData.json'),
    `${JSON.stringify({ globalAttributes }, null, 2)}\n`
  )
}

all()
