const fetch = require('node-fetch')
const cheerio = require('cheerio')
const fs = require('fs')
const path = require('path')

const referenceUrl =
  'https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Content_categories#Phrasing_content'

async function getPhrasingContentElements() {
  // @ts-ignore
  const html = await fetch(referenceUrl).then(res => res.text())
  const $ = cheerio.load(html)
  const tags = []

  $('#wikiArticle h3[id="Phrasing_content"]+p+p>a>code').each(
    (index, element) => {
      const html = $(element).html() //?
      const tagName = html.slice(4, -4) //?
      tags.push(tagName)
    }
  )
  return tags
}

;(async () => {
  const tags = await getPhrasingContentElements()
  const elements = tags.reduce(
    (total, current) => ({
      ...total,
      [current]: { categories: ['phrasing content'] },
    }),
    {}
  )

  fs.writeFileSync(
    path.join(
      __dirname,
      '../src/configs/generated/phrasingContent.htmlData.json'
    ),
    `${JSON.stringify({ elements }, null, 2)}\n`
  )
})()
