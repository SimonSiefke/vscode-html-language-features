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
]

function getHTML(site): Promise<string> {
  return axios.get(site).then(x => x.data)
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
