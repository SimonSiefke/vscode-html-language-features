import { analyzeDirectory } from '../analyze'
import * as path from 'path'

analyzeDirectory(
  path.join(__dirname, 'htmlFiles'),
  path.join(__dirname, 'generated'),
  'example'
)
