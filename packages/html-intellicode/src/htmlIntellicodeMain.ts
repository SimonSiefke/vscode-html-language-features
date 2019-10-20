// @ts-ignore
import * as rawStatistics from './generated/statistics.json'

delete rawStatistics['__meta__']

export const statistics = rawStatistics as {
  [key: string]:
    | {
        probability: number
        name: string
      }[]
    | undefined
}
