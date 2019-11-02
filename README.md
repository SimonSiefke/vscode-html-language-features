[![travis build](https://img.shields.io/travis/com/SimonSiefke/vscode-html-language-features?style=flat-square)](https://travis-ci.com/SimonSiefke/vscode-html-language-features) [![Version](https://vsmarketplacebadge.apphb.com/version/SimonSiefke.html-language-features.svg)](https://marketplace.visualstudio.com/items?itemName=SimonSiefke.html-language-features) [![Renovate enabled](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com/)

# HTML Language Features for VSCode

![Demo](./demo.png)

Features:

- Html intellisense
- Auto rename tags
- Auto close tags
- Highlight Matching Tags

<!-- TODO better image -->

Note: for this to work, you need to disable:

- the built in `html-language-features` extension
- the built in `emmet` extension

TODO:

- snippets
- support for emmet abbreviations

## Settings

You can specify custom data inside your vscode settings. After changing the configuration, you need to reload vscode.

```json
{
  "html.customData": {
    "tags": {
      "my-button": {
        "description": "Custom button element",
        "categories": ["flow content", "phrasing content", "palpable content"]
      }
    }
  }
}
```

<!-- TODO:  [html] Automatically delete HTML closing tag when converting to self-closing tag #58315  -->

<!-- TODO emmet is really smart: it computed the expansions as one types so when one hits tab the expansions are already computed and applied instantly -->

<!-- TODO


 -->
