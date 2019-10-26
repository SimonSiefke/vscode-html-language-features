import { parse, Node } from '@html-language-features/html-parser'
import * as fs from 'fs-extra'
import * as glob from 'glob'
import * as path from 'path'

let statistics = {}
let reversedStatistics = {}
let statisticsWithProbabilities = {}
let sourceUrl: string
let numberOfFiles: number

export const analyzeDirectoryForAttributes = async (
  inputDirectory,
  outputDirectory,
  outputFileName,
  _sourceUrl = 'unknown'
) => {
  sourceUrl = _sourceUrl
  statistics = {}
  reversedStatistics = {}
  statisticsWithProbabilities = {}
  numberOfFiles = -1
  const htmlFiles: string[] = await new Promise((resolve, reject) => {
    glob(`${inputDirectory}/**/*.html`, function(er, files) {
      if (er) {
        reject(er)
      }
      if (!files.length) {
        reject(new Error('no html files found'))
      }
      resolve(files)
    })
  })
  numberOfFiles = htmlFiles.length

  console.log('processing ' + htmlFiles.length + ' files')

  try {
    console.log('do analyze')
    for (const file of htmlFiles) {
      const content = fs.readFileSync(file, 'utf-8')
      analyze(content)
    }
    console.log('do compute probabilities')
    computeStatisticsWithProbabilities()
    fs.ensureDirSync(outputDirectory)
    fs.writeFileSync(
      path.join(outputDirectory, `${outputFileName}.statistics.json`),
      JSON.stringify(statisticsWithProbabilities, null, 2) + '\n'
    )
  } catch (error) {
    console.error('failed to process')
  }
}

function walk(tree, fn = tree => {}) {
  fn(tree)
  if (Array.isArray(tree.children)) {
    for (const leaf of tree.children) {
      walk(leaf, fn)
    }
  } //?
}

function analyze(text) {
  const rawTree = parse(text).roots
  const root = new Node(0, 0, rawTree)
  root.tagName = 'root'

  // rawTree //?

  walk(root, leaf => {
    if (!statistics[leaf.tagName]) {
      statistics[leaf.tagName] = { ___occurrences: 1 }
    } else {
      statistics[leaf.tagName].___occurrences++
    }

    for (const [attributeName, attributeValue] of Object.entries(
      leaf.attributes
    )) {
      statistics[leaf.tagName][attributeName] =
        statistics[leaf.tagName][attributeName] || {}

      if (statistics[leaf.tagName][attributeName][attributeValue]) {
        statistics[leaf.tagName][attributeName][attributeValue]++
      } else {
        statistics[leaf.tagName][attributeName][attributeValue] = 1
      }
    }
    let parentName = leaf.parent && leaf.parent.tagName
    if (parentName === undefined) {
      parentName = 'root'
    }
  })

  // root //?

  // @ts-ignore
  // delete statistics.root
}

const attributesWithAnyValues = [
  'class',
  'id',
  'href',
  'title',
  'placeholder',
  'for',
  'onclick',
  'aria-label',
  'style',
  'aria-labelledby',
  'height',
  'viewBox', // svg
  'xlink:href',
  'value',
  'alt',
  'src',
  'srcset',
  'name', // input, textarea but not meta
  'd', // path
  'x1',
  'y1',
  'x2',
  'y2',
  'integrity',
]

const isIgnoredAttributeValue = (attribute: string) =>
  attributesWithAnyValues.includes(attribute)

const isIgnoredAttribute = (attribute: string) =>
  attribute.startsWith('data-') ||
  attribute.startsWith('v-') ||
  attribute.startsWith('xml:')

const computeStatisticsWithProbabilities = () => {
  statisticsWithProbabilities['__meta__'] = {
    numberOfFiles,
    sourceUrl,
  }
  statistics
  for (const tag in statistics) {
    statisticsWithProbabilities[tag] = []
    statistics[tag] //?
    console.log('stats')

    const maxMax = Object.values(statistics[tag])
      .map(x => Object.values(x).reduce((total, current) => total + current, 0))
      .reduce((total, current) => total + current, 0) //?

    const occurrences = statistics[tag].___occurrences
    delete statistics[tag]['___occurrences']
    for (const attribute in statistics[tag]) {
      const max = Object.values(statistics[tag][attribute]).reduce(
        // @ts-ignore
        (total, current) => total + current,
        0
      )

      statistics[tag][attribute] //?

      let values = []
      if (isIgnoredAttribute(attribute)) {
        continue
      }
      if (!isIgnoredAttributeValue(attribute)) {
        values = Object.entries(statistics[tag][attribute]).map(
          // @ts-ignore
          ([key, value]) => ({ name: key, probability: value / max })
        )
      }
      statisticsWithProbabilities[tag].push({
        name: attribute,
        // @ts-ignore
        probability: max / occurrences,
        values,
      })
      console.log('max is' + max)
      console.log('maxmax is' + maxMax)
      // reversedStatistics[tag][attribute] = Object.values(
      //   statistics[tag][attribute]
      //   // @ts-ignore
      // ).reduce((total, current) => total + current, 0)
    }
  }
}

// const computeStatisticsWithProbabilities = () => {

//   for (const tag in reversedStatistics) {
//     statisticsWithProbabilities[tag] = []
//     const max = Object.values(reversedStatistics[tag]).reduce(
//       // @ts-ignore
//       (total, current) => total + current,
//       0
//     )

//     for (const attribute in reversedStatistics[tag]) {

//     }
//   }
// }

analyze(
  '<h1 class="big" width="10px"><button>hello world</button></h1><h1 class="red"></h1>'
)
computeStatisticsWithProbabilities()

statisticsWithProbabilities['h1'] //?
