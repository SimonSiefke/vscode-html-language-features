import { parse, Node } from 'html-parser'
import * as fs from 'fs'
import * as path from 'path'

const folder = 'files'

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

const statistics = {}
function analyze(text) {
  const rawTree = parse(text).roots
  const root = new Node(0, 0, rawTree)
  root.tagName = 'root'

  walk(root, leaf => {
    statistics[leaf.tagName] = statistics[leaf.tagName] || {}
    const parentName = leaf.parent && leaf.parent.tagName
    if (statistics[leaf.tagName][parentName]) {
      statistics[leaf.tagName][parentName]++
    } else {
      statistics[leaf.tagName][parentName] = 1
    }
  })

  // @ts-ignore
  delete statistics.root
}

const dir = fs.readdirSync(path.join(__dirname,'..', folder))
for (const file of dir) {
  const content = fs.readFileSync(path.join(__dirname,'..', folder, file), 'utf-8')
  analyze(content)
}

// analyze('<h1><div></div><div></div><p></p></h1>')

// statistics

const reversedStatistics = {}

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
    // tag
    // otherTag
  }
}
// reversedStatistics

const finalStatistics = {}
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
    finalStatistics[tag].push({ name, frequency })
  }
}

const statisticsWithProbabilities = {}
for (const tag in finalStatistics) {
  const max = finalStatistics[tag].reduce(
    (total, current) => total + current.frequency,
    0
  )
  statisticsWithProbabilities[tag] = []
  for (const suggestion of finalStatistics[tag]) {
    statisticsWithProbabilities[tag].push({
      name: suggestion.name,
      probability: suggestion.frequency / max,
    })
  }
}

statisticsWithProbabilities

if (!fs.existsSync(path.join(__dirname, 'generated'))) {
  fs.mkdirSync(path.join(__dirname, 'generated'))
}
fs.writeFileSync(
  path.join(__dirname, 'generated/statistics.json'),
  JSON.stringify(statisticsWithProbabilities, null, 2) + '\n'
)
