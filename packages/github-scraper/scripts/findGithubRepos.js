const axios = require('axios').default
const cheerio = require('cheerio')

const searchUrl =
  'https://github.com/search?o=desc&q=html+language%3AHTML&s=updated&type=Repositories'
const baseUrl = 'https://github.com'

exports.getRepoUrls = async () => {
  // @ts-ignore
  console.log('fetching repo urls...')
  const html = await axios.get(searchUrl).then(res => res.data)
  const $ = cheerio.load(html)

  const repoLinks = $('.repo-list-item a.v-align-middle')
    .map((index, element) => {
      return element.attribs.href
    })
    .get()
  if (repoLinks.length === 0) {
    throw new Error('no repos found')
  }
  return repoLinks.map(relativeLink => baseUrl + relativeLink)
}
