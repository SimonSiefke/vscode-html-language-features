export interface VscodeConfig {
  version: number
  tags: Tag[]
  globalAttributes?: Attribute[]
}

export interface Attribute {
  name: string
  spec?: string
  description?: string
  href?: string
}

export interface Tag {
  name: string
  spec: string
  attributes: Attribute[]
  attributeCategories: string[]
  description?: string
}

const transformAttributes: (attributes: Attribute[]) => any = attributes => {
  if (!attributes) {
    return {}
  }
  const resultAttributes: { [key: string]: any } = {}
  for (const attribute of attributes) {
    resultAttributes[attribute.name] = {
      description: attribute.description,
    }
  }
  return resultAttributes
}

export const transformVscodeConfig: (
  vscodeConfig: VscodeConfig
) => any = vscodeConfig => {
  const resultTags: { [key: string]: any } = {}
  for (const tag of vscodeConfig.tags) {
    resultTags[tag.name] = {
      description: tag.description,
      attributes: transformAttributes(tag.attributes),
    }
  }
  return {
    tags: resultTags,
  }
}

// transformVscodeConfig({
//   version: 1,
//   tags: [
//     {
//       name: 'a',
//       spec: 'https://www.w3.org/TR/SVG/linking.html#AElement',
//       attributes: [
//         {
//           name: 'href',
//           href: 'https://www.w3.org/TR/SVG/linking.html#AElementHrefAttribute',
//           description:
//             'The **`href`** attribute defines a link to a resource as a reference [URL](https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#URL). The exact meaning of that link depends on the context of each element using it.',
//         },
//         {
//           name: 'target',
//           href:
//             'https://www.w3.org/TR/SVG/linking.html#AElementTargetAttribute',
//         },
//         {
//           name: 'download',
//           href:
//             'https://www.w3.org/TR/SVG/linking.html#AElementDownloadAttribute',
//         },
//         {
//           name: 'ping',
//           href: 'https://www.w3.org/TR/SVG/linking.html#AElementPingAttribute',
//         },
//         {
//           name: 'rel',
//           href: 'https://www.w3.org/TR/SVG/linking.html#AElementRelAttribute',
//         },
//         {
//           name: 'hreflang',
//           href:
//             'https://www.w3.org/TR/SVG/linking.html#AElementHreflangAttribute',
//         },
//         {
//           name: 'type',
//           href: 'https://www.w3.org/TR/SVG/linking.html#AElementTypeAttribute',
//           description:
//             "The `type` attribute is a generic attribute and it has different meaning based on the context in which it's used.",
//         },
//         {
//           name: 'referrerpolicy',
//           href:
//             'https://www.w3.org/TR/SVG/linking.html#AElementReferrerpolicyAttribute',
//         },
//       ],
//       attributeCategories: [
//         'aria',
//         'conditional processing',
//         'core',
//         'global event',
//         'document element event',
//         'graphical event',
//         'presentation',
//         'deprecated xlink',
//       ],
//       description:
//         'The **<a>** SVG element creates a hyperlink to other web pages, files, locations within the same page, email addresses, or any other URL.',
//     },
//   ],
// }) //?
