import { Config } from '../Config'
import axios from 'axios'

export const resolveConfig: (url: string) => Promise<Config> = async url => {
  return axios.get(url).then(res => res.data)
}
