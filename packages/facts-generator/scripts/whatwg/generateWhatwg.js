const fetch = require('node-fetch')
const cheerio = require('cheerio')
const fs = require('fs-extra')
const path = require('path')

const referenceUrl =
  'https://html.spec.whatwg.org/multipage/indices.html#elements-3'

/** @typedef {{elementName:string, parents:string[], categories:string[],
      description:string,
      children:string[],
      attributes:string[]}} PreElement */

async function getElementsInfo() {
  // @ts-ignore
  const html = await fetch(referenceUrl).then(res => res.text())
  const $ = cheerio.load(html)
  const table = $('#elements-3 + p + table').html()

  const trs = $(table).find('tbody tr')
  return trs
    .map((index, tr) => {
      const ths = $(tr)
        .find('th')
        .get()
      const tds = $(tr)
        .find('td')
        .get()
      let elementName = $(ths[0])
        .find('a')
        .html()
      const description = $(tds[0]).html()
      const categories = $(tds[1])
        .find('a')
        .map((index, a) => $(a).html())
        .get()
      const parents = $(tds[2])
        .find('a')
        .map((index, a) => $(a).html())
        .get()
      let children = $(tds[3])
        .find('a')
        .map((index, a) => $(a).html())
        .get()
      const attributes = $(tds[4])
        .find('a')
        .map((index, a) => $(a).html())
        .get()

      if (elementName === 'SVG <code>svg</code>') {
        elementName = 'svg'
      }
      if (elementName === 'MathML <code>math</code>') {
        elementName = 'math'
      }
      if (elementName.includes('<')) {
        elementName
        throw new Error('invalid element name')
      }
      children = children.filter(child => {
        if (child === '[MATHML]') {
          return false
        }
        if (child === '[SVG]') {
          return false
        }
        if (child.includes('[')) {
          throw new Error('invalid child')
        }
        return true
      })
      return {
        elementName,
        description,
        categories,
        parents,
        children,
        attributes,
      }
    })
    .get()
}

const categoryMap = {
  flow: 'flow content',
  phrasing: 'phrasing content',
  embedded: 'embedded content',
  interactive: 'interactive content',
  listed: 'listed content',
  submittable: 'submittable content',
  'form-associated': 'form-associated content',
  palpable: 'palpable content',
  sectioning: 'sectioning content',
  'sectioning root': 'sectioning root content',
  heading: 'heading',
  resettable: 'resettable',
  labelable: 'labelable',
  metadata: 'metadata',
  'script-supporting': 'script-supporting',
  'script-supporting elements': 'script-supporting',
  transparent: 'transparent',
}

const getRefinedCategory = category => {
  if (categoryMap[category]) {
    return categoryMap[category]
  }
  throw new Error('unknown category')
}

const isCategory = category => !!categoryMap[category]

/**
 * @type {(keyof typeof categoryMap)[]}
 */
const ignoredCategories = ['transparent']

const isIgnoredCategory = category =>
  isCategory(category) && ignoredCategories.includes(category)

const getTags = async () => {
  /**
   * @type {PreElement[]}
   */
  // @ts-ignore
  const elementsInfos = await getElementsInfo() //?

  return elementsInfos.reduce((total, info) => {
    const attributes = info.attributes
      .filter(attribute => {
        if (attribute === 'globals') {
          return false
        }
        if (attribute === '[SVG]') {
          return false
        }
        if (attribute === '[MATHML]') {
          return false
        }
        if (attribute.includes('[')) {
          attribute
          throw new Error('invalid attribute')
        }
        return true
      })
      .reduce(
        (total, current) => ({
          ...total,
          [current]: {},
        }),
        {}
      ) //?
    const permittedParentTags = info.parents
      // .filter(parent => !isIgnoredCategory(parent))
      .map(parent => {
        if (isCategory(parent)) {
          return {
            category: getRefinedCategory(parent),
          }
        }
        return parent
      })
    const categories = info.categories
      // .filter(category => !isIgnoredCategory(category))
      .map(getRefinedCategory)

    let allowedSubTags = info.children
      .filter(child => !isIgnoredCategory(child))
      .map(child => {
        if (isCategory(child)) {
          return {
            category: getRefinedCategory(child),
          }
        }

        if (child.startsWith('allowed')) {
          child //?
        }
        child //?
        return child
      })
    if (allowedSubTags.length === 0 && info.children.length > 0) {
      allowedSubTags = undefined
    }

    return {
      ...total,
      [info.elementName]: {
        categories,
        attributes,
        permittedParentTags,
        allowedSubTags,
      },
    }
  }, {})
}

const all = async () => {
  const tags = await getTags() //?
  delete tags['autonomous custom elements']

  fs.ensureDirSync(path.join(__dirname, '../../generated'))
  fs.writeFileSync(
    path.join(__dirname, '../../generated/whatwg.htmlData.json'),
    JSON.stringify(
      {
        tags,
      },
      null,
      2
    ) + '\n'
  )
}

all()
// ;(async () => {
//   const tags = await getFlowContentElements()
//   const processedTags = tags.reduce(
//     (total, current) => ({
//       ...total,
//       [current]: { categories: ['flow content'] },
//     }),
//     {}
//   )

//   fs.ensureDirSync(path.join(__dirname, '../../generated'))

//   fs.writeFileSync(
//     path.join(__dirname, '../../generated/whatwg.htmlData.json'),
//     `${JSON.stringify({ tags: processedTags }, null, 2)}\n`
//   )
// })()
