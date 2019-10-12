import { createScanner } from '../htmlScanner/htmlScanner'

const scanner = createScanner('<h1>hello world</h1>')

let token
// while ((token = scanner.scan())) {
//   console.log(token)
// }
// scanner.scan() //?

let x = 2 //?
