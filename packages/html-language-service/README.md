# html-language-service

This package holds all the functionalities for html.

Note: The HTML parser is only intended for development purposes. It doesn't handle edge cases (like parsing `<script>alert("</script>")</script>`) because that would increase the code complexity and size, but as long the code is normal, it should work fine.
