import { parse, Node } from '@html-language-features/html-parser'
import * as fs from 'fs-extra'
import * as path from 'path'
import * as glob from 'glob'

let statistics = {}
let reversedStatistics = {}
let finalStatistics = {}
let statisticsWithProbabilities = {}
let numberOfFiles = -1
let sourceUrl
let meta = {}

export const analyzeDirectoryForTags = async (
  inputDirectory,
  outputDirectory,
  outputFileName,
  _sourceUrl = 'unknown'
) => {
  sourceUrl = _sourceUrl
  statistics = {}
  reversedStatistics = {}
  finalStatistics = {}
  statisticsWithProbabilities = {}
  numberOfFiles = -1
  meta = {}
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
    console.log('do reverse analyze')
    reverseAnalyzeStatistics()
    console.log('do finalize')
    finalizeStatistics()
    console.log('do compute probabilities')
    computeStatisticsWithProbabilities()
    fs.ensureDirSync(outputDirectory)
    fs.writeFileSync(
      path.join(outputDirectory, `${outputFileName}.htmlData.json`),
      JSON.stringify(
        {
          __meta__: meta,
          elements: statisticsWithProbabilities,
        },
        null,
        2
      ) + '\n'
    )
  } catch (error) {
    console.error('failed to process')
    console.error(error)
    process.exit(1)
  }
}

function pretty(tree) {
  if (Array.isArray(tree)) {
    return tree.map(pretty)
  }
  return {
    tagName: tree.tagName,
    children: pretty(tree.children),
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

  walk(root, leaf => {
    if (leaf.tagName === '!doctype') {
      leaf.tagName = '!DOCTYPE'
    }
    statistics[leaf.tagName] = statistics[leaf.tagName] || {}
    let parentName = leaf.parent && leaf.parent.tagName
    if (parentName === undefined) {
      parentName = 'root'
    }
    if (statistics[leaf.tagName][parentName]) {
      statistics[leaf.tagName][parentName]++
    } else {
      statistics[leaf.tagName][parentName] = 1
    }
  })

  // root //?

  // @ts-ignore
  // delete statistics.root
}

// analyze('<h1><div></div><div></div><p></p></h1>')

// statistics

const reverseAnalyzeStatistics = () => {
  for (const tag in statistics) {
    for (const otherTag in statistics) {
      // if (tag === otherTag) {
      //   continue
      // }
      if (statistics[tag][otherTag]) {
        reversedStatistics[otherTag] = reversedStatistics[otherTag] || {}
        reversedStatistics[otherTag][tag] = statistics[tag][otherTag]
        // tag
        // statistics[tag][otherTag] //?
        // console.log('yes')
      }
    }
  }
  reversedStatistics
  // @ts-ignore
  delete reversedStatistics.root.root
}

const finalizeStatistics = () => {
  for (const tag in reversedStatistics) {
    // let max = 0
    let tags = []
    for (const otherTag in reversedStatistics[tag]) {
      const frequency = reversedStatistics[tag][otherTag]
      tags.push([otherTag, frequency])
      // if (reversedStatistics[tag][otherTag] > max) {
      //   finalStatistics[tag] = otherTag
      // }
    }
    tags = tags.sort((a, b) => (a[1] < b[1] ? 1 : -1))
    finalStatistics[tag] = []
    for (const [name, frequency] of tags) {
      finalStatistics[tag].push({
        name,
        frequency,
      })
    }
  }
}

const computeStatisticsWithProbabilities = () => {
  meta = {
    numberOfFiles,
    sourceUrl,
  }
  for (const tag in finalStatistics) {
    const max = finalStatistics[tag].reduce(
      (total, current) => total + current.frequency,
      0
    )
    statisticsWithProbabilities[tag] = {
      allowedChildren: {},
    }
    for (const suggestion of finalStatistics[tag]) {
      statisticsWithProbabilities[tag].allowedChildren[suggestion.name] = {
        probability: suggestion.frequency / max,
      }
      // statisticsWithProbabilities[tag].push({
      //   name: suggestion.name,
      // })
    }
  }

  statisticsWithProbabilities
}

// if (!fs.existsSync(path.join(root, 'src/generated'))) {
//   fs.mkdirSync(path.join(root, 'src/generated'))
// }
// fs.writeFileSync(
//   path.join(root, 'src/generated/statistics.json'),
//   JSON.stringify(statisticsWithProbabilities, null, 2) + '\n'
// )

// TODO section should be more likely than script in body (probably)
