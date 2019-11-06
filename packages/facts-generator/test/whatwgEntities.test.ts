import { Config } from '@html-language-features/schema'
import _whatwgEntitiesConfig from '../generated/whatwgEntities.json'

const whatwgEntitiesConfig = _whatwgEntitiesConfig as Config

test('&AElig; Æ', () => {
  expect(whatwgEntitiesConfig).toHaveProperty('AElig', 'Æ')
})

test('&RightArrow; →', () => {
  expect(whatwgEntitiesConfig).toHaveProperty('RightArrow', '→')
})

test('non-existing', () => {
  expect(whatwgEntitiesConfig).not.toHaveProperty('non-existing')
})
