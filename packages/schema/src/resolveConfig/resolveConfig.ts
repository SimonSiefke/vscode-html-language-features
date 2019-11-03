import axios from 'axios'
import { Config } from '../Config'

export const resolveConfig: (url: string) => Promise<Config> = async url => {
  const text = await axios.get(url).then(res => res.data)
  return JSON.parse(text) as Config
}
