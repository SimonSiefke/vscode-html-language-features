const { getRepoUrls } = require('./findGithubRepos')
const { processRepository } = require('./processRepo')

;(async () => {
  try {
    const repoUrls = await getRepoUrls()
    for (const repoUrl of repoUrls) {
      console.log('process repo ' + repoUrl)
      await processRepository(repoUrl)
      console.log('finished ' + repoUrl)
      console.log('\n\n')
    }
  } catch (error) {
    console.error(error)
  }
})()
