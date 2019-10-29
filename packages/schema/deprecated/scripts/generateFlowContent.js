const fetch = require('node-fetch')
const cheerio = require('cheerio')
const fs = require('fs')
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
  const elements = tags.reduce(
    (total, current) => ({
      ...total,
      [current]: { categories: ['flow content'] },
    }),
    {}
  )

  fs.writeFileSync(
    path.join(__dirname, '../src/configs/generated/flowContent.htmlData.json'),
    `${JSON.stringify({ elements }, null, 2)}\n`
  )
})()
