import { findMatchingTags, MatchingTagResult } from "./findMatchingTags";

test("can match from opening and closing tag", () => {
  const data = "<a>a</a>\na";
  const expected: MatchingTagResult = {
    type: "startAndEndTag",
    tagName: "a",
    startTagOffset: 0,
    endTagOffset: 4
  };
  expect(findMatchingTags(data, 0)).toEqual(expected);
  expect(findMatchingTags(data, 1)).toEqual(expected);
  expect(findMatchingTags(data, 2)).toEqual(expected);
  expect(findMatchingTags(data, 3)).toEqual(undefined);
  expect(findMatchingTags(data, 4)).toEqual(expected);
  expect(findMatchingTags(data, 5)).toEqual(expected);
  expect(findMatchingTags(data, 6)).toEqual(expected);
  expect(findMatchingTags(data, 7)).toEqual(expected);
  expect(findMatchingTags(data, 8)).toEqual(undefined);
  expect(findMatchingTags(data, 9)).toEqual(undefined);
  expect(findMatchingTags(data, 10)).toEqual(undefined);
});

test.skip("can match nested with invalid tags", () => {
  const data = "<a><b></c></b>";
  const expected = {
    opening: { name: "b", start: 3, end: 6 },
    closing: { name: "b", start: 10, end: 14 }
  };
  expect(findMatchingTags(data, 0)).toEqual(undefined);
  expect(findMatchingTags(data, 4)).toEqual(expected);
  expect(findMatchingTags(data, 12)).toEqual(expected);
  expect(findMatchingTags(data, 1)).toEqual(undefined);
  expect(findMatchingTags(data, 8)).toEqual(undefined);
});

test("unclosed start tags", () => {
  const data = "<a>a";
  const expected: MatchingTagResult = {
    type: "onlyStartTag",
    tagName: "a",
    startTagOffset: 0
  };
  expect(findMatchingTags(data, 0)).toEqual(expected);
  expect(findMatchingTags(data, 1)).toEqual(expected);
  expect(findMatchingTags(data, 2)).toEqual(expected);
  expect(findMatchingTags(data, 3)).toEqual(undefined);
  expect(findMatchingTags(data, 4)).toEqual(undefined);
});

test("with comments", () => {
  const data = `<div><!-- </div> --></div>`;
  const expected: MatchingTagResult = {
    type: "startAndEndTag",
    tagName: "div",
    startTagOffset: 0,
    endTagOffset: 20
  };
  expect(findMatchingTags(data, 0)).toEqual(expected);
  expect(findMatchingTags(data, 10)).toEqual(undefined);
  expect(findMatchingTags(data, 20)).toEqual(expected);
});

test("unfinished opening tags", () => {
  const data = "<a</a>";
  const expected: MatchingTagResult = {
    type: "onlyStartTag",
    tagName: "a<",
    startTagOffset: 0
  };
  expect(findMatchingTags(data, 0)).toEqual(expected);
  expect(findMatchingTags(data, 1)).toEqual(expected);
  expect(findMatchingTags(data, 2)).toEqual(undefined);
  expect(findMatchingTags(data, 3)).toEqual(undefined);
  expect(findMatchingTags(data, 4)).toEqual(undefined);
  expect(findMatchingTags(data, 5)).toEqual(undefined);
  expect(findMatchingTags(data, 6)).toEqual(undefined);
});

test.skip("empty tags", () => {
  // TODO stackoverflow error
  const data = "<></>";
  const expected: MatchingTagResult = {
    type: "startAndEndTag",
    tagName: "",
    startTagOffset: 0,
    endTagOffset: 2
  };
  expect(findMatchingTags(data, 0)).toEqual(expected);
  expect(findMatchingTags(data, 1)).toEqual(expected);
  expect(findMatchingTags(data, 2)).toEqual(expected);
  expect(findMatchingTags(data, 3)).toEqual(expected);
  expect(findMatchingTags(data, 4)).toEqual(expected);
  expect(findMatchingTags(data, 5)).toEqual(expected);
});

test("bug 1", () => {
  const data = `<body >
    <div >  </div>
  </body>`;
  const expectedBody: MatchingTagResult = {
    type: "startAndEndTag",
    tagName: "body",
    startTagOffset: 0,
    endTagOffset: 29
  };
  const expectedDiv: MatchingTagResult = {
    type: "startAndEndTag",
    tagName: "div",
    startTagOffset: 12,
    endTagOffset: 20
  };
  expect(findMatchingTags(data, 0)).toEqual(expectedBody); // '<'
  expect(findMatchingTags(data, 1)).toEqual(expectedBody); // 'b'
  expect(findMatchingTags(data, 2)).toEqual(expectedBody); // 'o'
  expect(findMatchingTags(data, 3)).toEqual(expectedBody); // 'd'
  expect(findMatchingTags(data, 4)).toEqual(expectedBody); // 'y'
  expect(findMatchingTags(data, 5)).toEqual(expectedBody); // ' '
  expect(findMatchingTags(data, 6)).toEqual(expectedBody); // '>'
  expect(findMatchingTags(data, 7)).toEqual(undefined); // '\n'
  expect(findMatchingTags(data, 8)).toEqual(undefined); // ' '
  expect(findMatchingTags(data, 9)).toEqual(undefined); // ' '
  expect(findMatchingTags(data, 10)).toEqual(undefined); // ' '
  expect(findMatchingTags(data, 11)).toEqual(undefined); // ' '
  expect(findMatchingTags(data, 12)).toEqual(expectedDiv); // '<'
  expect(findMatchingTags(data, 13)).toEqual(expectedDiv); // 'd'
  expect(findMatchingTags(data, 14)).toEqual(expectedDiv); // 'i'
  expect(findMatchingTags(data, 15)).toEqual(expectedDiv); // 'v'
  expect(findMatchingTags(data, 16)).toEqual(expectedDiv); // ' '
  expect(findMatchingTags(data, 17)).toEqual(expectedDiv); // '>'
  expect(findMatchingTags(data, 18)).toEqual(undefined); // ' '
  expect(findMatchingTags(data, 19)).toEqual(undefined); // ' '
  expect(findMatchingTags(data, 20)).toEqual(expectedDiv); // '<'
  expect(findMatchingTags(data, 21)).toEqual(expectedDiv); // '/'
  expect(findMatchingTags(data, 22)).toEqual(expectedDiv); // 'd'
  expect(findMatchingTags(data, 23)).toEqual(expectedDiv); // 'i'
  expect(findMatchingTags(data, 24)).toEqual(expectedDiv); // 'v'
  expect(findMatchingTags(data, 25)).toEqual(expectedDiv); // '>'
  expect(findMatchingTags(data, 26)).toEqual(undefined); // '\n'
  expect(findMatchingTags(data, 27)).toEqual(undefined); // ' '
  expect(findMatchingTags(data, 28)).toEqual(undefined); // ' '
  expect(findMatchingTags(data, 29)).toEqual(expectedBody); // '<'
  expect(findMatchingTags(data, 30)).toEqual(expectedBody); // '/'
  expect(findMatchingTags(data, 31)).toEqual(expectedBody); // 'b'
  expect(findMatchingTags(data, 32)).toEqual(expectedBody); // 'o'
  expect(findMatchingTags(data, 33)).toEqual(expectedBody); // 'd'
  expect(findMatchingTags(data, 34)).toEqual(expectedBody); // 'y'
  expect(findMatchingTags(data, 35)).toEqual(expectedBody); // '>'
  expect(findMatchingTags(data, 36)).toEqual(undefined); // ''
});

test("deep nested tags", () => {
  const data =
    '<a><span><ins>hello</ins><img src="./something.png" alt="" /><del>world</del></span></a>';
  const expectedA: MatchingTagResult = {
    type: "startAndEndTag",
    tagName: "a",
    startTagOffset: 0,
    endTagOffset: 84
  };
  const expectedSpan: MatchingTagResult = {
    type: "startAndEndTag",
    tagName: "span",
    startTagOffset: 3,
    endTagOffset: 77
  };
  const expectedIns: MatchingTagResult = {
    type: "startAndEndTag",
    tagName: "ins",
    startTagOffset: 9,
    endTagOffset: 19
  };
  const expectedImg: MatchingTagResult = {
    type: "onlyStartTag",
    tagName: "img",
    startTagOffset: 25
  };
  const expectedDel: MatchingTagResult = {
    type: "startAndEndTag",
    tagName: "del",
    startTagOffset: 61,
    endTagOffset: 71
  };
  expect(findMatchingTags(data, 0)).toEqual(expectedA); // '<'
  expect(findMatchingTags(data, 1)).toEqual(expectedA); // 'a'
  expect(findMatchingTags(data, 2)).toEqual(expectedA); // '>'
  expect(findMatchingTags(data, 3)).toEqual(expectedSpan); // '<'
  expect(findMatchingTags(data, 4)).toEqual(expectedSpan); // 's'
  expect(findMatchingTags(data, 5)).toEqual(expectedSpan); // 'p'
  expect(findMatchingTags(data, 6)).toEqual(expectedSpan); // 'a'
  expect(findMatchingTags(data, 7)).toEqual(expectedSpan); // 'n'
  expect(findMatchingTags(data, 8)).toEqual(expectedSpan); // '>'
  expect(findMatchingTags(data, 9)).toEqual(expectedIns); // '<'
  expect(findMatchingTags(data, 10)).toEqual(expectedIns); // 'i'
  expect(findMatchingTags(data, 11)).toEqual(expectedIns); // 'n'
  expect(findMatchingTags(data, 12)).toEqual(expectedIns); // 's'
  expect(findMatchingTags(data, 13)).toEqual(expectedIns); // '>'
  expect(findMatchingTags(data, 14)).toEqual(undefined); // 'h'
  expect(findMatchingTags(data, 15)).toEqual(undefined); // 'e'
  expect(findMatchingTags(data, 16)).toEqual(undefined); // 'l'
  expect(findMatchingTags(data, 17)).toEqual(undefined); // 'l'
  expect(findMatchingTags(data, 18)).toEqual(undefined); // 'o'
  expect(findMatchingTags(data, 19)).toEqual(expectedIns); // '<'
  expect(findMatchingTags(data, 20)).toEqual(expectedIns); // '/'
  expect(findMatchingTags(data, 21)).toEqual(expectedIns); // 'i'
  expect(findMatchingTags(data, 22)).toEqual(expectedIns); // 'n'
  expect(findMatchingTags(data, 23)).toEqual(expectedIns); // 's'
  expect(findMatchingTags(data, 24)).toEqual(expectedIns); // '>'
  expect(findMatchingTags(data, 25)).toEqual(expectedImg); // '<'
  expect(findMatchingTags(data, 26)).toEqual(expectedImg); // 'i'
  expect(findMatchingTags(data, 27)).toEqual(expectedImg); // 'm'
  expect(findMatchingTags(data, 28)).toEqual(expectedImg); // 'g'
  expect(findMatchingTags(data, 29)).toEqual(expectedImg); // ' '
  expect(findMatchingTags(data, 30)).toEqual(expectedImg); // 's'
  expect(findMatchingTags(data, 31)).toEqual(expectedImg); // 'r'
  expect(findMatchingTags(data, 32)).toEqual(expectedImg); // 'c'
  expect(findMatchingTags(data, 33)).toEqual(expectedImg); // '='
  expect(findMatchingTags(data, 34)).toEqual(expectedImg); // '"'
  expect(findMatchingTags(data, 35)).toEqual(expectedImg); // '.'
  expect(findMatchingTags(data, 36)).toEqual(expectedImg); // '/'
  expect(findMatchingTags(data, 37)).toEqual(expectedImg); // 's'
  expect(findMatchingTags(data, 38)).toEqual(expectedImg); // 'o'
  expect(findMatchingTags(data, 39)).toEqual(expectedImg); // 'm'
  expect(findMatchingTags(data, 40)).toEqual(expectedImg); // 'e'
  expect(findMatchingTags(data, 41)).toEqual(expectedImg); // 't'
  expect(findMatchingTags(data, 42)).toEqual(expectedImg); // 'h'
  expect(findMatchingTags(data, 43)).toEqual(expectedImg); // 'i'
  expect(findMatchingTags(data, 44)).toEqual(expectedImg); // 'n'
  expect(findMatchingTags(data, 45)).toEqual(expectedImg); // 'g'
  expect(findMatchingTags(data, 46)).toEqual(expectedImg); // '.'
  expect(findMatchingTags(data, 47)).toEqual(expectedImg); // 'p'
  expect(findMatchingTags(data, 48)).toEqual(expectedImg); // 'n'
  expect(findMatchingTags(data, 49)).toEqual(expectedImg); // 'g'
  expect(findMatchingTags(data, 50)).toEqual(expectedImg); // '"'
  expect(findMatchingTags(data, 51)).toEqual(expectedImg); // ' '
  expect(findMatchingTags(data, 52)).toEqual(expectedImg); // 'a'
  expect(findMatchingTags(data, 53)).toEqual(expectedImg); // 'l'
  expect(findMatchingTags(data, 54)).toEqual(expectedImg); // 't'
  expect(findMatchingTags(data, 55)).toEqual(expectedImg); // '='
  expect(findMatchingTags(data, 56)).toEqual(expectedImg); // '"'
  expect(findMatchingTags(data, 57)).toEqual(expectedImg); // '"'
  expect(findMatchingTags(data, 58)).toEqual(expectedImg); // ' '
  expect(findMatchingTags(data, 59)).toEqual(expectedImg); // '/'
  expect(findMatchingTags(data, 60)).toEqual(expectedImg); // '>'
  expect(findMatchingTags(data, 61)).toEqual(expectedDel); // '<'
  expect(findMatchingTags(data, 62)).toEqual(expectedDel); // 'd'
  expect(findMatchingTags(data, 63)).toEqual(expectedDel); // 'e'
  expect(findMatchingTags(data, 64)).toEqual(expectedDel); // 'l'
  expect(findMatchingTags(data, 65)).toEqual(expectedDel); // '>'
  expect(findMatchingTags(data, 66)).toEqual(undefined); // 'w'
  expect(findMatchingTags(data, 67)).toEqual(undefined); // 'o'
  expect(findMatchingTags(data, 68)).toEqual(undefined); // 'r'
  expect(findMatchingTags(data, 69)).toEqual(undefined); // 'l'
  expect(findMatchingTags(data, 70)).toEqual(undefined); // 'd'
  expect(findMatchingTags(data, 71)).toEqual(expectedDel); // '<'
  expect(findMatchingTags(data, 72)).toEqual(expectedDel); // '/'
  expect(findMatchingTags(data, 73)).toEqual(expectedDel); // 'd'
  expect(findMatchingTags(data, 74)).toEqual(expectedDel); // 'e'
  expect(findMatchingTags(data, 75)).toEqual(expectedDel); // 'l'
  expect(findMatchingTags(data, 76)).toEqual(expectedDel); // '>'
  // TODO bug with get previous open tag name and self closing tag
  // expect(findMatchingTags(data, 77)).toEqual(expectedSpan); // '<'
  // expect(findMatchingTags(data, 78)).toEqual(expectedSpan); // '/'
  // expect(findMatchingTags(data, 79)).toEqual(expectedSpan); // 's'
  // expect(findMatchingTags(data, 80)).toEqual(expectedSpan); // 'p'
  // expect(findMatchingTags(data, 81)).toEqual(expectedSpan); // 'a'
  // expect(findMatchingTags(data, 82)).toEqual(expectedSpan); // 'n'
  // expect(findMatchingTags(data, 83)).toEqual(expectedSpan); // '>'
  // expect(findMatchingTags(data, 84)).toEqual(expectedA); // '<'
  // expect(findMatchingTags(data, 85)).toEqual(expectedA); // '/'
  // expect(findMatchingTags(data, 86)).toEqual(expectedA); // 'a'
  // expect(findMatchingTags(data, 87)).toEqual(expectedA); // '>'
  expect(findMatchingTags(data, 88)).toEqual(undefined); // ''
});

test.skip("can match tag from content", () => {
  const data = "<a>a</a>";
  const expected = {
    attributeNestingLevel: 0,
    opening: { name: "a", start: 0, end: 3 },
    closing: { name: "a", start: 4, end: 8 }
  };
  expect(findMatchingTags(data, 0)).toEqual(undefined);
  expect(findMatchingTags(data, 1)).toEqual(expected);
  expect(findMatchingTags(data, 2)).toEqual(expected);
  expect(findMatchingTags(data, 3)).toEqual(expected);
  expect(findMatchingTags(data, 4)).toEqual(expected);
  expect(findMatchingTags(data, 5)).toEqual(expected);
  expect(findMatchingTags(data, 6)).toEqual(expected);
  expect(findMatchingTags(data, 7)).toEqual(expected);
  expect(findMatchingTags(data, 8)).toEqual(undefined);
});

test("matches self closing tag when flag is true", () => {
  const data = `<div/>`;
  const expected: MatchingTagResult = {
    type: "onlyStartTag",
    tagName: "div",
    startTagOffset: 0
  };
  expect(findMatchingTags(data, 0)).toEqual(expected);
  expect(findMatchingTags(data, 1)).toEqual(expected);
  expect(findMatchingTags(data, 2)).toEqual(expected);
  expect(findMatchingTags(data, 3)).toEqual(expected);
  expect(findMatchingTags(data, 4)).toEqual(expected);
  // expect(findMatchingTags(data, 5)).toEqual(expected) // TODO
  expect(findMatchingTags(data, 6)).toEqual(undefined);
});
