const fetch = require('node-fetch')
const cheerio = require('cheerio')
const fs = require('fs-extra')
const path = require('path')

const referenceUrl =
  'https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Content_categories'

async function getFlowContentElements() {
  // @ts-ignore
  const html = await fetch(referenceUrl).then(res => res.text())
  const $ = cheerio.load(html)
  const tags = []

  $('#wikiArticle h3[id="Flow_content"]+p>a>code').each((index, element) => {
    const html = $(element).html() //?
    const tagName = html.slice(4, -4) //?
    tags.push(tagName)
  })
  return tags
}

;(async () => {
  const tags = await getFlowContentElements()
  const processedTags = tags.reduce(
    (total, current) => ({
      ...total,
      [current]: { categories: ['flow content'] },
    }),
    {}
  )

  fs.ensureDirSync(path.join(__dirname, '../../generated'))

  fs.writeFileSync(
    path.join(__dirname, '../../generated/mdnFlowContent.htmlData.json'),
    `${JSON.stringify({ tags: processedTags }, null, 2)}\n`
  )
})()
