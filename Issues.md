https://github.com/microsoft/vscode/issues/58315

# wrap html tag

- https://github.com/microsoft/vscode/issues/14103

## suggestions

- svg support https://github.com/microsoft/vscode/issues/66053
- data attributes https://github.com/microsoft/vscode/issues/40149
- context aware https://github.com/microsoft/vscode/issues/375

## auto close tag

- https://github.com/microsoft/vscode/issues/52777
- multicursor: https://github.com/microsoft/vscode/issues/78893
- multicursor: https://github.com/microsoft/vscode/issues/33429
- dont duplicate close https://github.com/microsoft/vscode/issues/35143
- wrong closing tab https://github.com/microsoft/vscode/issues/24322
- wrong undo/redo https://github.com/microsoft/vscode/issues/52777

## embedded support

- json https://github.com/microsoft/vscode/issues/36280

## descriptions

- events and aria attributes https://github.com/microsoft/vscode/issues/69318

## slowness

- long documents https://github.com/microsoft/vscode/issues/47712

## syntax

- webpack syntax https://github.com/microsoft/vscode/issues/52495

## interesting features

- auto id class https://github.com/microsoft/vscode/issues/33592
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
some attribute value enums missing
spellcheck: true/false inside sentence, maybe hard to extract
input/autocorrect 'on' | 'off'
 -->

<!-- TODO idea
fast completions:
<div spellcheck="|"> type "t" automatically complete to true


 -->

<!-- TODO auto insert quotes after equal sing for attributes
https://github.com/microsoft/vscode/issues/18071
 -->

<!-- TODO
maybe merge auto-rename-tag and highlight-matching-tag since they both need to know about matching tags and currently it is computed separately for each of them
separately
 -->

<!--
figure out why `!??` is a suggested tag inside a `div`

filter out custom tags like `<todo-item>` when fetching sites

<!-- analyze error (statistics): https://github.com/lyons194/Intellident-Website-Python-Flask -->

-->

<!-- TODO
autoclose tag bug

https://youtrack.jetbrains.com/issue/WEB-36793

 -->

<!-- TODO
test https://youtrack.jetbrains.com/issue/WEB-18206
<div id="div1">
    <div class="dummy" id="div2">
    </div>
</div>


 -->

<!-- TODO
completion for input/autocomplete https://youtrack.jetbrains.com/issue/WEB-32612

 -->

<!-- TODO

not sure
https://youtrack.jetbrains.com/issue/WEB-33713
 -->

<!-- TODO auto rename tag issue https://youtrack.jetbrains.com/issue/WEB-28449 / test case -->

<!-- TODO other bugs
https://youtrack.jetbrains.com/issue/WEB-28014
https://youtrack.jetbrains.com/issue/WEB-28004
 -->

<!-- TODO idea
fuzzy search for attributes
<input tt> -> <input type="text">
<input tn> -> <input type="number">
 -->

 <!-- TODO idea
 need a way to go inside tag
 input -> <input>|
 input -> <input | > -> <input tt| > -> <input type="text" | >
 input -> <input | > -> <input tn| > -> <input type="number" | >

  -->

<!-- TODO
https://youtrack.jetbrains.com/issue/WEB-13292
 -->

<!-- TODO
very interesting, maybe also for adding attribute(classes or something)
https://youtrack.jetbrains.com/issue/WEB-14154

original request is to wrap with tag:
<h1>hello world</h1>.div -> wrapping with div

another idea is similar to auto-class-id
<h1>.</h1> -> <h1 | ></h1>
<h1></h1>. -> <h1 | ></h1>
go inside the tag
 -->

<!-- TODO
class name validation
https://youtrack.jetbrains.com/issue/WEB-8150
in cooperation with css language server / class name provider
 -->

<!-- TODO

sparkup
https://youtrack.jetbrains.com/issue/WEB-537
 -->

<!-- TODO idea
ul li a*3
<ul>
  <li><a></a></li>
  <li><a></a></li>
  <li><a></a></li>
</ul>

apply multiplication to sensible selector

ul li a lorem10*3



p+p
<p></p>
<p></p>
 -->

<!-- TODO
attribute types https://www.w3.org/TR/REC-html40/index/attributes.html
and https://www.w3.org/TR/2017/REC-html52-20171214/fullindex.html#attributes-table

 -->

<!-- TODO
new completion api

https://code.visualstudio.com/updates/v1_40#_support-intellisense-replace-mode
 -->

<!-- TODO why is deprecated contextmenu showing up in attribute names? -->

<!-- TODO
attributes:
contenteditable -> boolean

extract values from global attributes (should be same as for normal attributes):
dir: ltr or rtl
draggable -> boolean
 -->

<!-- TODO
align attributes wrong because notes

 -->

<!-- TODO

autocapitalization wrong because of multiple
 -->
