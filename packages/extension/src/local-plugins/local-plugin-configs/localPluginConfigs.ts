import * as fs from 'fs'
import * as path from 'path'
import * as util from 'util'
import * as vscode from 'vscode'
import { RequestType } from 'vscode-languageclient'
import { LocalPlugin } from '../localPlugin'
import { transformVscodeConfig } from './transformVscodeConfig'

const readFile = util.promisify(fs.readFile)

const configsReplaceRequest = new RequestType<string, undefined, any, any>(
  'html/configs-replace'
)

const getCustomDataFromExtension: (
  extension: vscode.Extension<any>
) => string[] = extension =>
  (extension.packageJSON &&
    extension.packageJSON &&
    extension.packageJSON.contributes &&
    extension.packageJSON.contributes.html &&
    extension.packageJSON.contributes.html.customData) ||
  (extension.packageJSON &&
    extension.packageJSON &&
    extension.packageJSON.contributes &&
    extension.packageJSON.contributes.html &&
    extension.packageJSON.contributes.html.experimental.customData)

const getConfigsFromExtension: (
  extension: vscode.Extension<any>
) => Promise<any[]> = async extension => {
  const vscodeConfig = getCustomDataFromExtension(extension)
  if (Array.isArray(vscodeConfig)) {
    const absolutePaths = vscodeConfig.map(relativePath =>
      path.join(extension.extensionPath, relativePath)
    )
    const configs = await Promise.all(
      absolutePaths.map(async absolutePath => {
        const fileContent = await readFile(absolutePath, 'utf-8')
        const vscodeConfig = JSON.parse(fileContent)
        return transformVscodeConfig(vscodeConfig)
      })
    )
    return configs
  }
  return []
}

const getConfigsFromExtensions: () => Promise<any[]> = async () => {
  const result = await Promise.all(
    vscode.extensions.all.map(getConfigsFromExtension)
  )
  return result.flat()
}

const getConfigsFromWorkspaceFolders: () => Promise<any[]> = async () => {
  const result = await Promise.all(
    (vscode.workspace.workspaceFolders || []).map(async workspaceFolder => {
      const customData = vscode.workspace
        .getConfiguration('html', workspaceFolder.uri)
        .get<{ extends?: string[] }>('customData')
      if (!customData) {
        return []
      }
      if (customData.extends) {
        const otherConfigs = await Promise.all(
          customData.extends.map(async extendsPath => {
            if (extendsPath.startsWith('https')) {
              return extendsPath
            }
            const absolutePath = path.resolve(
              workspaceFolder.uri.fsPath,
              extendsPath
            )
            const fileContent = await readFile(absolutePath, 'utf-8')
            return JSON.parse(fileContent)
          })
        )
        customData.extends = customData.extends.filter(extend =>
          extend.startsWith('https')
        )
        return [customData, ...otherConfigs]
      }
      return [customData]
    })
  )
  return result.flat()
}

export const localPluginConfigs: LocalPlugin = async api => {
  const askServerToUpdateConfigsFromExtensions: (
    configs: any[]
  ) => Promise<void> = async configs => {
    await api.languageClientProxy.sendRequest(
      configsReplaceRequest,
      JSON.stringify({
        id: 'configs.from.extensions',
        configs: configs,
      })
    )
  }
  const askServerToUpdateConfigsFromWorkspaceFolders: (
    configs: any[]
  ) => Promise<void> = async configs => {
    await api.languageClientProxy.sendRequest(
      configsReplaceRequest,
      JSON.stringify({
        id: 'configs.from.workspaceFolders',
        configs: configs,
      })
    )
  }
  api.vscodeProxy.extensions.onDidChange(async () => {
    const changedConfigs = await getConfigsFromExtensions()
    await askServerToUpdateConfigsFromExtensions(changedConfigs)
  })
  const initialConfigsFromExtensions = await getConfigsFromExtensions()
  await askServerToUpdateConfigsFromExtensions(initialConfigsFromExtensions)
  const initialConfigsFromWorkspaceFolders = await getConfigsFromWorkspaceFolders()
  await askServerToUpdateConfigsFromWorkspaceFolders(
    initialConfigsFromWorkspaceFolders
  )

  const watcher = vscode.workspace.createFileSystemWatcher('**/*.htmlData.json')
  api.context.subscriptions.push(
    watcher.onDidChange(async () => {
      const changedWorkspaceFolderConfigs = await getConfigsFromWorkspaceFolders()
      await askServerToUpdateConfigsFromWorkspaceFolders(
        changedWorkspaceFolderConfigs
      )
    })
  )
}
