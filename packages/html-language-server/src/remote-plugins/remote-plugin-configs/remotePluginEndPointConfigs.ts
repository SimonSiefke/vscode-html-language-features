import { RemotePlugin } from '../remotePlugin'
import { RequestType } from 'vscode-languageserver'
import { replaceConfigs } from '@html-language-features/html-language-service'

const configsReplaceRequest = new RequestType<string, undefined, any, any>(
  'html/configs-replace'
)

export const remotePluginConfigs: RemotePlugin = api => {
  api.connectionProxy.onRequest(configsReplaceRequest, params => {
    const { id, configs } = JSON.parse(params)
    replaceConfigs(configs, id)
  })
}
