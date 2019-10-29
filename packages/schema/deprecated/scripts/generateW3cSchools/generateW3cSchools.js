const fetch = require('node-fetch')
const cheerio = require('cheerio')
const fs = require('fs')
const path = require('path')

const referenceUrl = 'https://www.w3schools.com/tags/default.asp'

async function getTagsAndDescriptions() {
  // @ts-ignore
  const html = await fetch(referenceUrl).then(res => res.text())
  const $ = cheerio.load(html)
  const tags = []
  const tagDescriptions = []

  $('#htmltags tr td:first-child a').each((index, element) => {
    if (element.attribs.class === 'notsupported') {
      return
    }
    const tagNameInAngleBrackets = element.children[0].data
    let tagName = tagNameInAngleBrackets.slice(1, -1).toLowerCase()
    if (tagName === '!doctype') {
      tagName = '!DOCTYPE'
    }
    // TODO
    // else if(tagName === '<h1> to <h6>'){

    // }
    tags.push(tagName)
  })
  $('#htmltags tr td:last-child')
    .filter(
      (index, element) =>
        !$(element)
          .find('.deprecated')
          .text()
    )
    .each((index, element) => {
      const text = element.children[0].data.replace(/\n/g, ' ')
      tagDescriptions.push(text)
    })
  // the first tag is a comment and we don't care
  tags.shift()
  tagDescriptions.shift()
  return { tags, tagDescriptions }
}

;(async () => {
  const { tags, tagDescriptions } = await getTagsAndDescriptions()
  const elements = {}
  for (const [i, tag] of tags.entries()) {
    const tagDescription = tagDescriptions[i]
    elements[tag] = {
      description: tagDescription,
    }
  }
  elements
  fs.writeFileSync(
    path.join(__dirname, '../../generated/w3cSchools.htmlData.json'),
    `${JSON.stringify({ elements }, null, 2)}\n`
  )
})()
