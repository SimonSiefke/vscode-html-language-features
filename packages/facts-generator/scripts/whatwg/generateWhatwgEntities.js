const fetch = require('node-fetch')
const fs = require('fs-extra')
const url = 'https://html.spec.whatwg.org/entities.json'
const path = require('path')

const getEntities = async () => {
  // @ts-ignore
  const json = await fetch(url).then(res => res.json())
  return json
}

const all = async () => {
  const entities = await getEntities() //?
  const processedEntities = {}
  for (const entity in entities) {
    processedEntities[entity.slice(1, -1)] = entities[entity].characters
  }
  processedEntities
  fs.ensureDir(path.join(__dirname, '../../generated'))
  fs.writeFileSync(
    path.join(__dirname, '../../generated/whatwgEntities.json'),
    JSON.stringify(processedEntities, null, 2) + '\n'
  )
}

all()
