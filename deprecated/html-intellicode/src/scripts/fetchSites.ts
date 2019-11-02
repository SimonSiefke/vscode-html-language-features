import axios from 'axios'
import { parse } from 'url'
import * as fs from 'fs'
import * as path from 'path'

const root = path.join(__dirname, '../../')

const sites = [
  'https://www.kevinpowell.co/',
  'https://wesbos.com/',
  'https://www.freecodecamp.org/',
  // 'https://kentcdodds.com/', TODO work around generated code like <style> tags inside div, usually a bad suggestion
  'https://www.paypal.com/',
  'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input',
  // 'https://codepen.io/', Blocked by Cloudflare
  'https://marcozehe.wordpress.com/2014/03/11/easy-aria-tip-7-use-listbox-and-option-roles-when-constructing-autocomplete-lists/',
  'https://css-tricks.com/emmet/',
  'http://info.cern.ch/',
  'http://tholman.com/',
  'https://johnpapa.net/',
  'https://www.leveluptutorials.com/',
  'https://themify.me/themify-icons',
  'https://getbootstrap.com/',
  'https://svelte.dev/docs',
  'https://vuejs.org/v2/guide/',
  'https://www.w3.org/',
  'https://www.w3schools.com/html/default.asp',
]

async function getHTML(site): Promise<string> {
  try {
    const result = await axios.get(site).then(x => x.data)
    return result
  } catch (error) {
    console.error('failed to fetch ' + site)
    throw error
  }
}

function getReadableName(site) {
  const url = parse(site).host
  return url.replace(/^www\./, '').replace(/\.[^\.]*$/, '')
}

// getReadableName(sites[2]) //?

// getHTML(sites[0]) //?

if (!fs.existsSync(path.join(root, 'files'))) {
  fs.mkdirSync(path.join(root, 'files'))
}

;(async () => {
  let progress = 0
  for (const site of sites) {
    const html = await getHTML(site)
    const readableName = getReadableName(site)
    const filePath = path.join(root, 'files', `${readableName}.html`)
    fs.writeFileSync(filePath, html)
    console.log(`${++progress}/${sites.length}`)
  }
})()
