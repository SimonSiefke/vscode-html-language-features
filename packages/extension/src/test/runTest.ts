import * as path from 'path'
import { runTests, downloadAndUnzipVSCode } from 'vscode-test'
import * as rimraf from 'rimraf'

const vscodeVersion = '1.40.0'
;(async () => {
  try {
    const extensionDevelopmentPath = path.resolve(__dirname, '../../')
    const extensionTestsPath = path.resolve(__dirname, './suite/index')

    await downloadAndUnzipVSCode(vscodeVersion)
    const builtInHtmlLanguageFeaturesPath = path.join(
      __dirname,
      `../../.vscode-test/vscode-${vscodeVersion}/VSCode-linux-x64/resources/app/extensions/html-language-features`
    )
    rimraf.sync(builtInHtmlLanguageFeaturesPath)
    await runTests({
      version: vscodeVersion,
      extensionDevelopmentPath,
      extensionTestsPath,
      // vscodeExecutablePath: path.join(
      //   __dirname,
      //   `../../.vscode-test/vscode-${vscodeVersion}/VSCode-linux-x64/bin/code`
      // ),
      launchArgs: ['--disable-extensions'],
    })
  } catch (err) {
    console.error('Failed to run tests')
    process.exit(1)
  }
})()
