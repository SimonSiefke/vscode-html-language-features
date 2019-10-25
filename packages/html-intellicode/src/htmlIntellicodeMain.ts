// @ts-ignore
import * as rawStatisticsForTags from 'statistics-generator/src/generated/tags.statistics.json'
// @ts-ignore
import * as rawStatisticsForAttributes from 'statistics-generator/src/generated/attributes.statistics.json'

// @ts-ignore
// const rawStatisticsForTags = {}
// @ts-ignore
// const rawStatisticsForAttributes = {}

console.log(rawStatisticsForTags)
console.log(rawStatisticsForAttributes)

delete rawStatisticsForTags['__meta__']
delete rawStatisticsForAttributes['__meta__']

export const statisticsForTags = (rawStatisticsForTags as unknown) as {
  [key: string]:
    | {
        probability: number
        name: string
      }[]
    | undefined
}

export const statisticsForAttributes = (rawStatisticsForAttributes as unknown) as {
  [key: string]:
    | {
        probability: number
        name: string
      }[]
    | undefined
}
