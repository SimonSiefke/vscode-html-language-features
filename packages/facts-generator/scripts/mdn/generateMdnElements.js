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

const reference = 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element'

/** @typedef {{href:string, deprecated:boolean, name:string , experimental:boolean} } PreElement */

/**
 * @return {Promise<PreElement[]>}
 */
const getHtmlElementsAndLinks = async () => {
  // @ts-ignore
  const html = await fetch(reference).then(res => res.text())
  // @ts-ignore
  const $ = cheerio.load(html)

  const tags = $('summary')
    .filter((index, x) => x.firstChild.data === 'HTML elements')
    .parent()
    .find('ol li')
    .map((index, element) => element)

  tags //?
  const elementCodes = tags
    .map((index, element) =>
      $(element)
        .find('a')
        .html()
    )
    .get() //?
  const elementNames = elementCodes.map(code => code.slice(10, -11)) //?
  const elementLinks = tags
    .map((index, element) =>
      $(element)
        .find('a')
        .attr('href')
    )
    .get() //?
  const deprecatedElements = tags
    .map(
      (index, element) =>
        $(element)
          .find('i[class="icon-trash"]')
          .html() || 'no'
    )
    .get()
    .map(element => element !== 'no')
  const obsoleteElements = tags
    .map(
      (index, element) =>
        $(element)
          .find('i[class="icon-thumbs-down-alt"]')
          .html() || 'no'
    )
    .get()
    .map(element => element !== 'no')
  const experimentalElements = tags
    .map(
      (index, element) =>
        $(element)
          .find('i[class="icon-beaker"]')
          .html() || 'no'
    )
    .get()
    .map(element => element !== 'no')

  //?

  return elementNames.map((_, index) => ({
    deprecated: deprecatedElements[index] || obsoleteElements[index],
    name: elementNames[index],
    href: elementLinks[index],
    experimental: experimentalElements[index],
  }))
}

exports.getHtmlElementsAndLinks = getHtmlElementsAndLinks

// getHtmlElementsAndLinks() //?

/**
 *
 * @param {PreElement} element
 * @return {Promise<{selfClosing: boolean, reference:{ url:string,name:string}, description:string, attributes:{deprecated:boolean,name:string, experimental:boolean, description: string}[]}>}
 */
const getInfoForElement = async element => {
  const fullUrl = 'https://developer.mozilla.org/' + element.href
  // @ts-ignore
  const html = await fetch(fullUrl).then(res => res.text())
  // @ts-ignore
  const $ = cheerio.load(html)
  const description = $('#wikiArticle .seoSummary').html() //?

  /**
   * @type{string[]}
   */
  const attributeNames = $('#Attributes ~ dl')
    .not('#Usage_notes ~ dl, #Methods ~ dl')
    .find('dt')
    .map((index, element) => {
      const link = $(element)
        .find('a')
        .html()
      outer: if (link) {
        if (link.includes('<')) {
          const codeInsideLink = $(link)
            .find('code')
            .html()
          if (codeInsideLink) {
            if (codeInsideLink.includes('<')) {
              throw new Error('invalid code 1' + link)
            }
            return codeInsideLink
          }
          console.error(fullUrl)

          throw new Error('invalid code 2' + link)
        }
        return link
      }
      const code = $(element)
        .find('code')
        .html()
      if (code) {
        if (code.includes('<')) {
          console.error(code)
          throw new Error('invalid code 3' + code)
        }
        return code
      }
      if (
        $(element).html() &&
        $(element)
          .html()
          .trim()
      ) {
        console.error('error in ' + element.name)
        console.error($(element).html())
        console.error(fullUrl)
        throw new Error('nothing found')
      }
    })
    .get() //?

  const obsoleteAttributeNames = $('#wikiArticle > dl')
    .find('dt')
    .map(
      (index, element) =>
        $(element)
          .find('.obsolete, .icon-trash')
          .html() || 'no'
    )
    .get()
    .map(element => element !== 'no') //?
  const experimentalAttributeNames = $('#wikiArticle > dl')
    .find('dt')
    .map(
      (index, element) =>
        $(element)
          .find('.icon-beaker')
          .html() || 'no'
    )
    .get()
    .map(element => element !== 'no') //?

  const attributeDescriptions = $('#wikiArticle > dl')
    .find('dt+dd')
    .get()
    .map(element => $(element).html())
  // .map((index, element) => {
  //   console.log('000' + index + $(element).html()) //?
  //   return $(element).html()
  // })
  // .get() //?

  const selfClosing =
    $('td').filter((index, element) =>
      [
        /must not have an end tag/i,
        /end tag must not/i,
        /no closing tag/i,
        /end tag is forbidden/i,
      ].some(re =>
        re.test(
          $(element)
            .text()
            .trim()
        )
      )
    ).length === 1 //?

  return {
    selfClosing,
    description,
    reference: {
      name: 'MDN Reference',
      url: fullUrl,
    },
    attributes: attributeNames.map((_, index) => ({
      name: attributeNames[index],
      description: attributeDescriptions[index],
      deprecated: obsoleteAttributeNames[index],
      experimental: experimentalAttributeNames[index],
    })),
  }
}

const all = async () => {
  const elementsAndLinks = await getHtmlElementsAndLinks()
  const fullElementInfo = await Promise.all(
    elementsAndLinks.map(async element => {
      const elementInfo = await getInfoForElement(element)
      return {
        reference: elementInfo.reference,
        name: element.name,
        description: elementInfo.description,
        deprecated: element.deprecated,
        experimental: element.experimental,
        selfClosing: elementInfo.selfClosing,
        attributes: elementInfo.attributes,
      }
    })
  )
  fullElementInfo

  /**
   *
   * @param {string} description
   */
  const fixDescription = description => {
    const baseUrl = 'https://developer.mozilla.org/'
    return description.replace(/a href="\//g, `a href="${baseUrl}`)
  }

  const fixDescriptionMarkdown = description => {
    if (!description) {
      return undefined
    }
    // @ts-ignore
    return turndownService.turndown(description)
  }
  /**
   *
   * @param {{name:string,deprecated:boolean,experimental:boolean, description:string}[]} attributes
   * @param {{url:string, name:string|undefined}} reference
   */
  const fixAttributes = (reference, attributes) => {
    if (Object.keys(attributes).length === 0) {
      return undefined
    }
    return attributes.reduce((total, current) => {
      let attributeReference = reference
      if (attributeReference !== undefined) {
        attributeReference = {
          ...reference,
          url: reference.url + `#attr-${current.name}`,
        }
      }
      return {
        ...total,
        [current.name]: {
          deprecated: current.deprecated || undefined,
          experimental: current.experimental || undefined,
          description: fixDescriptionMarkdown(current.description),
          reference: attributeReference,
        },
      }
    }, {})
  }

  const tags = fullElementInfo.reduce(
    (total, current) => ({
      ...total,
      [current.name]: {
        reference: current.reference,
        experimental: current.experimental || undefined,
        deprecated: current.deprecated || undefined,
        selfClosing: current.selfClosing || undefined,
        description: fixDescriptionMarkdown(current.description),
        attributes: fixAttributes(current.reference, current.attributes),
      },
    }),
    {}
  )

  fs.ensureDirSync(path.join(__dirname, '../../generated'))
  fs.writeFileSync(
    path.join(__dirname, '../../generated/mdn.htmlData.json'),
    `${JSON.stringify({ tags }, null, 2)}\n`
  )
}

all()
// getInfoForElement({
//   href: '/en-US/docs/Web/HTML/Element/body',
// }) //?

// TODO handle input attributes (they are in a table and not inside a dl)
// TODO handle events not as attributes
