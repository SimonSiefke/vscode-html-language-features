https://github.com/microsoft/vscode/issues/58315

# wrap html tag

- https://github.com/microsoft/vscode/issues/14103

## suggestions

- svg support https://github.com/microsoft/vscode/issues/66053
- custom tags https://github.com/microsoft/vscode/issues/62976
- html entities https://github.com/microsoft/vscode/issues/63217
- data attributes https://github.com/microsoft/vscode/issues/40149
- context aware https://github.com/microsoft/vscode/issues/375
- attributes https://github.com/microsoft/vscode/issues/7008

## auto close tag

- https://github.com/microsoft/vscode/issues/52777
- multicursor: https://github.com/microsoft/vscode/issues/78893
- multicursor: https://github.com/microsoft/vscode/issues/33429
- dont duplicate close https://github.com/microsoft/vscode/issues/35143
- wrong closing tab https://github.com/microsoft/vscode/issues/24322
- wrong undo/redo https://github.com/microsoft/vscode/issues/52777

## auto rename tag

- https://github.com/microsoft/vscode/issues/47069

## embedded support

- json https://github.com/microsoft/vscode/issues/36280

## descriptions

- events and aria attributes https://github.com/microsoft/vscode/issues/69318

## slowness

- long documents https://github.com/microsoft/vscode/issues/47712

## highlight matching tag

- case with duplicate end tag https://github.com/microsoft/vscode/issues/54616

## syntax

- webpack syntax https://github.com/microsoft/vscode/issues/52495

## interesting features

- auto id class https://github.com/microsoft/vscode/issues/33592
- show deprecated attributes https://github.com/microsoft/vscode/issues/47192
- star custom attributes https://github.com/microsoft/vscode/issues/68548
- go to css https://github.com/microsoft/vscode/issues/27892
- convert to self-closing tag https://github.com/microsoft/vscode/issues/58315
- macro: when typing select + tab, insert the select element and some option elements
- word to self-closing tag https://github.com/emmetio/emmet/issues/413
- hayaku: ctrl+enter adds curly braces in css
- read color from clipboard for css (hayaku) https://github.com/sindresorhus/clipboardy

## uncategorized

- https://github.com/microsoft/vscode/issues/79911

## todo

- check if element requires newline from mdn
- https://designmodo.com/css-editors/
- http://websitetips.com/html/tools/
- https://www.developerdrive.com/10-best-open-source-tools-for-web-developers/
- https://stackoverflow.com/questions/411954/tools-for-faster-better-web-development
- westciv
- search web development tools
- https://onextrapixel.com/useful-html5-tools-and-resources-for-web-designers-developers/
- https://royal.pingdom.com/ten-useful-open-source-tools-for-web-developers/
- https://savedelete.com/design/best-linux-web-development-tools/11623/
- https://softwareengineering.stackexchange.com/questions/17929/web-versus-desktop-development-is-web-development-worse

- https://stackoverflow.com/questions/130734/how-can-one-close-html-tags-in-vim-quickly

<!-- auto delete tag

Having

<xml>
	<test>
		<test2>Foo Bar</test2>
	</test>
</xml>

and deleting, let's say <test2 or </test2>, it should automatically remove the pairing tag.
 -->

<!-- multi cursor support for auto rename tag and others -->

<!-- TODO caching for get documentation or make it faster because currently its slow -->

<!-- TODO parsing error

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>
<body>
    <Header class=""></Header>

</body>
</html>
 -->

 <!-- TODO bug
Auto rename tag: enter space after "div", end tag is not renamed
  <divvvvvvvvvvv>

    </divvvvvvvvvvv>


  -->

<!-- TODO bug
parsing error
 <p>

    </
    p>
 -->

<!-- TODO bug
parsing error when cursor is at start tag

 <dl>
        <
      </dl>
 -->

<!-- TODO idea
writing tag with ! gives example:
h1! -> <h1>hello world</h1>
body! -> <body><h1>hello world</h1>
select! -> <select><option>option 1</option><option>option 2</option></select>
ul! -> <ul><li>list item 1</li><li>list item 2</li></ul>
a! -> <a href="https://google.de" rel="noopener noreferrer">link to a website</a>
img! -> <img src="https://source.unsplash.com/random">
noscript! -> <noscript><p>Please enable Javascript to continue</p></noscript>
address! ->  <address>Written by <a href="mailto:webmaster@example.com">Jon Doe</a>.<br>Visit us at:<br></address>
article! ->  <article><h1>Google Chrome</h1><p>Google Chrome is a free, open-source web browser developed by Google, released in 2008.</p></article>
picture! ->  <picture><source media="(min-width: 650px)" srcset="img_pink_flowers.jpg"></picture>
progress! ->  <progress value="22" max="100"></progress>
script! ->  <script>console.log('hello world')</script>
table! ->  <table>
  <tr>
    <th>Month</th>
    <th>Savings</th>
  </tr>
  <tr>
    <td>January</td>
    <td>$100</td>
  </tr>
</table>

also for custom tags:
amp-carousel! ->
<amp-carousel type="slides"
                width="400"
                height="300"
                layout="responsive"
                lightbox>
    <amp-img src="https://unsplash.it/400/300?image=10"
             width="400"
             height="300"
             layout="responsive"
             alt="a sample image">
    </amp-img>
    <amp-img src="https://unsplash.it/400/300?image=11"
             width="400"
             height="300"
             layout="responsive"
             alt="a sample image">
    </amp-img>
    <amp-img src="https://unsplash.it/400/300?image=12"
             width="400"
             height="300"
             layout="responsive"
             alt="a sample image">
    </amp-img>
    <amp-img src="https://unsplash.it/400/300?image=13"
             width="400"
             height="300"
             layout="responsive"
             alt="a sample image">
    </amp-img>
  </amp-carousel>

 -->

<!-- TODO bug
type '/' as href, auto closing tag does its weird part

 <a href="/>"
 -->

<!-- TODO
extract attribute values from mdn for
- img / referrerpolicy (li and code)
- img / importance (p and code)

 -->
