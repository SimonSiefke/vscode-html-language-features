import { doCompletionElementClose } from './completionElementClose'

// TODO

test.skip('completion-element-close', () => {
  const testCases: { input: string; expected: string | undefined }[] = [
    {
      input: '<h1><|',
      expected: '<h1></h1>',
    },
  ]

  for (const testCase of testCases) {
    const offset = testCase.input.indexOf('|')
    expect(offset).toBeGreaterThan(-1)
    const text = testCase.input.replace('|', '')
    const result = doCompletionElementClose(text, offset)
    if (testCase.expected === undefined) {
      expect(result).toBe(undefined)
    } else {
      expect(result).toBeDefined()
      expect(text + (result && result.completionString)).toBe(testCase.expected)
    }
  }
})
