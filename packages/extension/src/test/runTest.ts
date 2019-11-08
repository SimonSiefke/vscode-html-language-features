import * as path from 'path'
import { runTests, downloadAndUnzipVSCode } from 'vscode-test'
import * as rimraf from 'rimraf'

const extensionRoot = path.join(__dirname, '../../')
const vscodeVersion = '1.40.0'
;(async () => {
  try {
    const extensionDevelopmentPath = path.resolve(__dirname, '../../')
    const extensionTestsPath = path.resolve(__dirname, './suite/index')
    const workspace = path.join(extensionRoot, `src/test/suite/workspace`)

    await downloadAndUnzipVSCode(vscodeVersion)
    const builtInHtmlLanguageFeaturesPath = path.join(
      __dirname,
      `../../.vscode-test/vscode-${vscodeVersion}/VSCode-linux-x64/resources/app/extensions/html-language-features`
    )
    const builtinEmmetPath = path.join(
      __dirname,
      `../../.vscode-test/vscode-${vscodeVersion}/VSCode-linux-x64/resources/app/extensions/emmet`
    )
    rimraf.sync(builtInHtmlLanguageFeaturesPath)
    rimraf.sync(builtinEmmetPath)
    await runTests({
      version: vscodeVersion,
      extensionDevelopmentPath,
      extensionTestsPath,
      // vscodeExecutablePath: path.join(
      //   __dirname,
      //   `../../.vscode-test/vscode-${vscodeVersion}/VSCode-linux-x64/bin/code`
      // ),
      launchArgs: ['--disable-extensions', workspace],
    })
  } catch (err) {
    console.error('Failed to run tests')
    process.exit(1)
  }
})()
