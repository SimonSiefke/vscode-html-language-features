const exec = require('execa')
const { analyzeDirectory } = require('statistics-generator')
const path = require('path')
const rimraf = require('rimraf')
// todo use degit for caching and speed

const downloadRepo = async repoUrl => {
  console.log(`cloning ${repoUrl}...`)
  try {
    const result = await exec('git', ['clone', repoUrl, 'tmp-repo'])
    console.log(result.stdout)
  } catch (error) {
    console.error('failed to clone repo' + repoUrl)
  }
  console.log(`done cloning`)
}

const undownloadRepo = async () => {
  return new Promise((resolve, reject) => {
    rimraf(inputDirectory, err => {
      if (err) {
        reject(err)
      }
      resolve()
    })
  })
}

const inputDirectory = path.join(__dirname, '../tmp-repo')
const outputDirectory = path.join(__dirname, '../generated')

const friendlyName = url =>
  url.slice('https://github.com/'.length).replace('/', '__')

exports.processRepository = async repositoryUrl => {
  await downloadRepo(repositoryUrl)
  await analyzeDirectory(
    inputDirectory,
    outputDirectory,
    friendlyName(repositoryUrl),
    repositoryUrl
  )
  await undownloadRepo()
}

// exports.processRepository('https://github.com/ZarkoDimitrijevic/Bootcamp')
