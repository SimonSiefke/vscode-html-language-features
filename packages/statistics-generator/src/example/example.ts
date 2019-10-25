import { analyzeDirectoryForTags } from '../analyzeTags'
import * as path from 'path'
import { analyzeDirectoryForAttributes } from '../analyzeAttributes'

analyzeDirectoryForTags(
  path.join(__dirname, 'htmlFiles'),
  path.join(__dirname, '../generated'),
  'tags'
)

analyzeDirectoryForAttributes(
  path.join(__dirname, 'htmlFiles'),
  path.join(__dirname, '../generated'),
  'attributes'
)
