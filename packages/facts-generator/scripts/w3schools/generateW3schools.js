const fetch = require('node-fetch')
const cheerio = require('cheerio')
const fs = require('fs')
const path = require('path')

const referenceUrl = 'https://www.w3schools.com/tags/default.asp'
const referenceName = 'W3Schools Reference'
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

// const getAttributeValues = async url => {
//   // @ts-ignore
//   const html = await fetch(url).then(res => res.text()) //?
//   const $ = cheerio.load(html)
//   const $table = $('.w3-table-all')
//   const tds = $table
//     .find('td')
//     .map((index, $td) => $($td).text())
//     .get()
//   const attributeValues = {}
//   for (let i = 0; i < tds.length; i += 2) {
//     const name = tds[i]
//     const description = tds[i + 1]
//     attributeValues[name] = {
//       description,
//     }
//   }
//   return attributeValues
// }

// getAttributeValues('https://www.w3schools.com/tags/tag_abbr.asp') //?
// getAttributeValues('https://www.w3schools.com/tags/att_a_target.asp') //?

const all = async () => {
  const { tags, tagDescriptions } = await getTagsAndDescriptions()
  const elements = {}
  const baseReferenceUrl = 'https://www.w3schools.com/tags/tag_'

  outer: for (const [i, tag] of tags.entries()) {
    if (tag === 'h1> to <h6') {
      for (let j = 1; j <= 6; j++) {
        const tagDescription = tagDescriptions[i]
        elements[`h${j}`] = {
          description: tagDescription.trim(),
          reference: {
            name: referenceName,
            url: baseReferenceUrl + 'hn' + '.asp',
          },
        }
      }
      continue outer
    }
    const tagDescription = tagDescriptions[i]
    elements[tag] = {
      description: tagDescription.trim(),
      reference: {
        url: baseReferenceUrl + tag + '.asp',
        name: referenceName,
      },
    }
  }
  elements
  fs.writeFileSync(
    path.join(__dirname, '../../generated/w3schools.htmlData.json'),
    `${JSON.stringify({ elements }, null, 2)}\n`
  )
}

// all()
