# schema

## Example 1: Adding Configuration for a custom `my-button` element

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

TODO

## Example 2: Adding the `loading` attribute to <img> and <iframe> elements

```json
{
  "$comment": "Adds lazy-loading attributes for img element",
  "definitions": {
    "attributes": {
      "loading": {
        "suggest": "lazy",
        "description": "The loading attribute allows a browser to defer loading offscreen images and iframes until users scroll near them.",
        "type": "enum",
        "options": {
          "auto": {
            "description": "Default lazy-loading behavior of the browser, which is the same as not including the attribute."
          },
          "eager": {
            "description": "Load the resource immediately, regardless of where it's located on the page."
          },
          "lazy": {
            "description": "Defer loading of the resource until it reaches a calculated distance from the viewport"
          }
        }
      }
    }
  },
  "elements": {
    "img": {
      "attributes": {
        "loading": {
          "$ref": "#/definitions/attributes/loading"
        }
      }
    },
    "iframe": {
      "attributes": {
        "loading": {
          "$ref": "#/definitions/attributes/loading"
        }
      }
    }
  }
}
```
