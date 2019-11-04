const fetch = require('node-fetch')
const cheerio = require('cheerio')
const fs = require('fs-extra')
const path = require('path')
const _ = require('lodash')

const {
  isCategory,
  getRefinedCategory,
  getElementsInfo,
} = require('./generateWhatwg')

const ignoredThings = ['labeled control', 'src', 'usemap']

const tags = [
  'label',
  'header',
  'table',
  'footer',
  'address',
  'form',
  'dfn',
  'a',
  'noscript',
  'progress',
  'meter',
  'img',
  'button',
  'input',
]

const mediaElements = ['audio', 'video']

const isIgnored = x => ignoredThings.includes(x)
async function getElementInfo(url, elementName) {
  // @ts-ignore
  const html = await fetch(url).then(res => res.text())
  const $ = cheerio.load(html)

  const dl = $(`#the-${elementName}-element ~ dl`).first() //?

  const contentModelDd1 = dl.find('dt:nth-of-type(3) + dd')
  const contentModelDd2 = dl.find('dt:nth-of-type(3) + dd + dd')

  let deepDisallowedSubTags = []
  for (const contentModelDd of [contentModelDd1, contentModelDd2]) {
    if (!contentModelDd || !contentModelDd.html()) {
      continue
    }
    const contentModelHtml = contentModelDd.html()
    const butThereIndex = contentModelHtml.indexOf('but there') //?
    const butWithIndex = contentModelHtml.indexOf('but with') //?
    const exceptForIndex = contentModelHtml.indexOf('except')
    if (butThereIndex !== -1 || butWithIndex !== -1) {
      let disallowedHtml
      if (exceptForIndex !== -1) {
        disallowedHtml = contentModelHtml.slice(
          Math.max(butThereIndex, butWithIndex),
          exceptForIndex
        )
      } else {
        disallowedHtml = contentModelHtml.slice(
          Math.max(butThereIndex, butWithIndex)
        )
      }

      const $disallowed = cheerio.load(disallowedHtml)
      const links = $disallowed('a')
        .map((index, a) => $(a).text())
        .get()

      for (const link of links) {
        if (isIgnored(link)) {
          // ignore
        } else if (isCategory(link)) {
          deepDisallowedSubTags.push({ category: getRefinedCategory(link) })
        } else if (tags.includes(link)) {
          deepDisallowedSubTags.push(link)
        } else if (link === 'media element') {
          deepDisallowedSubTags.push(...mediaElements)
        } else {
          console.log('text is ---' + link + '---')
          console.log(url)
          console.log(disallowedHtml)
          throw new Error('unknown thing' + link)
          process.exit(1)
        }
      }
    }
  }

  return deepDisallowedSubTags
}

// getElementInfo(
//   'https://html.spec.whatwg.org/multipage/form-elements.html#the-button-element',
//   'button'
// ) //?

// getElementInfo(
//   'https://html.spec.whatwg.org/multipage/scripting.html#the-noscript-element',
//   'noscript'
// ) //?

// getElementInfo(
//   'https://html.spec.whatwg.org/multipage/forms.html#the-label-element',
//   'label'
// ) //?
// label

const all = async () => {
  const rawInfos = await getElementsInfo() //?
  const infos = await Promise.all(
    rawInfos.map(async tag => {
      return {
        tagName: tag.elementName,
        deepDisallowedSubTags: await getElementInfo(
          `https://html.spec.whatwg.org/multipage/` + tag.elementLink,
          tag.elementName
        ),
      }
    })
  ) //?

  const tags = {}
  for (const info of infos) {
    let deepDisallowedSubTags = _.uniq(info.deepDisallowedSubTags)
    if (deepDisallowedSubTags.length === 0) {
      continue
    }
    tags[info.tagName] = {
      deepDisallowedSubTags,
    }
  }

  delete tags['autonomous custom elements']

  fs.ensureDirSync(path.join(__dirname, '../../generated'))
  fs.writeFileSync(
    path.join(
      __dirname,
      '../../generated/whatwgDeepDisallowedSubTags.htmlData.json'
    ),
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
