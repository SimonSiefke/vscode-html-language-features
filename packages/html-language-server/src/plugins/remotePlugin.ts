import { RemotePluginApi } from '../remotePluginApi/remotePluginApi'

export type RemotePlugin = (api: RemotePluginApi) => void
