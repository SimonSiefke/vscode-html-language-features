const fetch = require('node-fetch')
const cheerio = require('cheerio')
const fs = require('fs')
const path = require('path')

const referenceUrl = 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element'

/** @typedef {{href:string, deprecated:boolean, name:string , experimental:boolean} } PreElement */

/**
 * @return {Promise<PreElement[]>}
 */
const getHtmlElementsAndLinks = async () => {
  // @ts-ignore
  const html = await fetch(referenceUrl).then(res => res.text())
  const $ = cheerio.load(html)

  const elements = $('summary')
    .filter((index, x) => x.firstChild.data === 'HTML elements')
    .parent()
    .find('ol li')
    .map((index, element) => element)

  elements //?
  const elementCodes = elements
    .map((index, element) =>
      $(element)
        .find('a')
        .html()
    )
    .get() //?
  const elementNames = elementCodes.map(code => code.slice(10, -11)) //?
  const elementLinks = elements
    .map((index, element) =>
      $(element)
        .find('a')
        .attr('href')
    )
    .get() //?
  const deprecatedElements = elements
    .map(
      (index, element) =>
        $(element)
          .find('i[class="icon-trash"]')
          .html() || 'no'
    )
    .get()
    .map(element => element !== 'no')
  const obsoleteElements = elements
    .map(
      (index, element) =>
        $(element)
          .find('i[class="icon-thumbs-down-alt"]')
          .html() || 'no'
    )
    .get()
    .map(element => element !== 'no')
  const experimentalElements = elements
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

// getHtmlElementsAndLinks() //?

/**
 *
 * @param {PreElement} element
 * @return {Promise<{selfClosing: boolean, attributes:{deprecated:boolean,name:string, experimental:boolean, description: string}[]}>}
 */
const getInfoForElement = async element => {
  const fullUrl = 'https://developer.mozilla.org/' + element.href
  // @ts-ignore
  const html = await fetch(fullUrl).then(res => res.text())
  const $ = cheerio.load(html)
  const description = $('#wikiArticle .seoSummary').html() //?

  /**
   * @type{string[]}
   */
  const attributeNames = $('#wikiArticle > dl')
    .find('dt')
    .map((index, element) =>
      $(element)
        .find('code')
        .html()
    )
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
        name: element.name,
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
  /**
   *
   * @param {{name:string,deprecated:boolean,experimental:boolean, description:string}[]} attributes
   */
  const fixAttributes = attributes =>
    attributes.reduce(
      (total, current) => ({
        ...total,
        [current.name]: {
          deprecated: current.deprecated,
          experimental: current.experimental,
          description: fixDescription(current.description),
        },
      }),
      {}
    )
  const elements = fullElementInfo.reduce(
    (total, current) => ({
      ...total,
      [current.name]: {
        selfClosing: current.selfClosing,
        experimental: current.experimental,
        deprecated: current.deprecated,
        attributes: fixAttributes(current.attributes),
      },
    }),
    {}
  )

  fs.writeFileSync(
    path.join(__dirname, '../../src/configs/generated/mdn.htmlData.json'),
    `${JSON.stringify({ elements }, null, 2)}\n`
  )
}

all()
// getInfoForElement({
//   href: '/en-US/docs/Web/HTML/Element/body',
// }) //?

// TODO handle input attributes (they are in a table and not inside a dl)
// TODO handle events not as attributes
