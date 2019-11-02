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

const getAttributeNameOrValue = ($, $dt, fullUrl) => {
  const linkInsideCode = $dt.find('code a').html()
  if (linkInsideCode) {
    if (linkInsideCode.includes('<')) {
      throw new Error('invalid code 4')
    }
    return linkInsideCode
  }
  const code = $dt.find('code').html()
  if (code) {
    if (code.includes('<')) {
      console.error(code)
      throw new Error('invalid code 3' + code)
    }
    return code
  }
  const link = $dt.find('a').html()
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

  if ($dt.html() && $dt.html().trim()) {
    // console.error('error in ' + element.name)
    console.error($dt.html())
    console.error(fullUrl)
    throw new Error('nothing found')
  }
}
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
  const description = $('#wikiArticle .seoSummary').html() //

  const dlAttributes = $('#Attributes ~ dl')
    .not('#Usage_notes ~ dl, #Methods ~ dl')
    .get()

  const dlDeprecatedAttributes = $('#Deprecated_attributes + dl').get()

  const children = [
    ...$(dlAttributes)
      .children()
      .get(),
    ...$(dlDeprecatedAttributes)
      .children()
      .get(),
  ]

  const attributes = []
  /**
   * @type {any}
   */
  let currentAttribute

  const finishAttribute = () => {
    if (currentAttribute) {
      attributes.push(currentAttribute)
      currentAttribute = {}
    } else {
      currentAttribute = {}
    }
  }
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    console.log(child)
    if (child.type === 'tag' && child.name === 'dt') {
      finishAttribute()
      const attributeName = getAttributeNameOrValue($, $(child), fullUrl)
      const isObsolete =
        $(child)
          .find('.obsolete, .icon-trash')
          .html() !== null //?

      const isExperimental =
        $(child)
          .find('.icon-beaker')
          .html() !== null
      currentAttribute.name = attributeName
      currentAttribute.experimental = isExperimental
      currentAttribute.deprecated = isObsolete
    } else if (child.type === 'tag' && child.name === 'dd') {
      const childHtml = $(child).html()
      if (currentAttribute.description) {
        if (childHtml.includes('<dl>')) {
          const attributeValues = []
          /**
           * @type {any}
           */
          let currentAttributeValue
          const finishAttributeValue = () => {
            if (currentAttribute) {
              attributeValues.push(currentAttributeValue)
              currentAttributeValue = {}
            } else {
              currentAttributeValue = {}
            }
          }
          const grandGrandChildren = $(child)
            .find('dl')
            .children()
          for (let i = 0; i < children.length; i++) {
            const grandGrandChild = grandGrandChildren[i]
            if (
              grandGrandChild &&
              grandGrandChild.type === 'tag' &&
              grandGrandChild.name === 'dt'
            ) {
              finishAttributeValue()
              const attributeValueName = getAttributeNameOrValue(
                $,
                $(grandGrandChild),
                fullUrl
              )
              currentAttributeValue.name = attributeValueName
            } else if (
              grandGrandChild &&
              grandGrandChild.type === 'tag' &&
              grandGrandChild.name === 'dd'
            ) {
              const grandGrandChildHtml = $(grandGrandChild).html()
              currentAttributeValue.description = grandGrandChildHtml
            }
          }
          finishAttributeValue()
          currentAttribute.attributeValues = attributeValues.filter(Boolean)
        } else {
          // console.log(childHtml)
        }
      } else {
        currentAttribute.description = childHtml
      }
    }
  }
  finishAttribute()

  attributes //?

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
    attributes,
  }
}

// getInfoForElement('a') //?

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
   * @param {{name:string,deprecated:boolean,experimental:boolean, description:string, attributeValues:{name:string, description:string}[]}[] } attributes
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
      const attributeValues = current.attributeValues
      // console.log(attributeValues)
      let options
      if (attributeValues !== undefined) {
        options = {}
        for (const attributeValue of attributeValues) {
          // console.log(attributeValue)
          options[attributeValue.name] = {
            description: fixDescriptionMarkdown(attributeValue.description),
          }
        }
      }
      return {
        ...total,
        [current.name]: {
          deprecated: current.deprecated || undefined,
          experimental: current.experimental || undefined,
          description: fixDescriptionMarkdown(current.description),
          reference: attributeReference,
          options,
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
//   href: '/en-US/docs/Web/HTML/Element/img',
// }) //?

// TODO handle input attributes (they are in a table and not inside a dl)
// TODO handle events not as attributes
