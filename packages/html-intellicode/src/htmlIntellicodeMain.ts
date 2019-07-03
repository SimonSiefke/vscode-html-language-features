import * as rawStatistics from './generated/statistics.json'

export const statistics = rawStatistics as {
  [key: string]:
    | {
        probability: number
        name: string
      }[]
    | undefined
}
