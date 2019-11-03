import { Config } from '../Config'
import fetch from 'node-fetch'

export const resolveConfig: (url: string) => Promise<Config> = async url => {
  return fetch(url).then(res => res.json())
}
