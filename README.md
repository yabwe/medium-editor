# MediumEditor

This is a clone of [medium.com](https://medium.com) inline editor toolbar.

Since I always had problems with bloated editors and I loved the simplicity of medium.com solution I've tried to implement their WYSIWYG approach with this script.

MediumEditor has been written using vanilla JavaScript, no additional frameworks required.

Tested on Googe Chrome, Firefox and IE9+.

[![Build Status](https://travis-ci.org/daviferreira/medium-editor.png?branch=master)](https://travis-ci.org/daviferreira/medium-editor)

# Basic usage

![screenshot](https://raw.github.com/daviferreira/medium-editor/master/demo/img/medium-editor.jpg)

__demo__: [http://daviferreira.github.io/medium-editor/](http://daviferreira.github.io/medium-editor/)

First, you need to attach medium editor's stylesheet to your page:

```html
<link rel="stylesheet" href="css/medium-editor.css">
```

The next step is to reference the editor's script and instantiate a new MediumEditor object:

```html
<script src="js/medium-editor.js"></script>
<script>var editor = new MediumEditor('.editable');</script>
```

The above code will transform all the elements with the .editable class into HTML5 editable contents and add the medium editor toolbar to them.

You can also pass a list of HTML elements:

```javascript
var elements = document.querySelectorAll('.editable'),
    editor = new MediumEditor(elements);
```

## Initialization options

* __allowMultiParagraphSelection__: enables the toolbar when selecting multiple paragraphs/block elements. Default: true
* __anchorInputPlaceholder__: text to be shown as placeholder of the anchor input. Default: _Paste or type a link_
* __buttons__: the set of buttons to display on the toolbar. Default: ['bold', 'italic', 'underline', 'anchor', 'header1', 'header2', 'quote']
* __delay__: time in milliseconds to show the toolbar. Default: 0
* __diffLeft__: value in pixels to be added to the X axis positioning of the toolbar. Default: 0
* __diffTop__: value in pixels to be added to the Y axis positioning of the toolbar. Default: -5
* __disableReturn__:  enables/disables the use of the return-key. You can also set specific element behavior by using setting a data-disable-return attribute. Default: false
* __disableToolbar__: enables/disables the toolbar, adding only thecontenteditable behavior. You can also set specific element behavior by using setting a data-disable-toolbar attribute. Default: false
* __firstHeader__: HTML tag to be used as first header. Default: h3
* __forcePlainText__: Forces pasting as plain text. Default: true
* __placeholder__: Defines the default placeholder for empty contenteditables. You can overwrite it by setting a data-placeholder attribute on your elements. Default: 'Type your text'
* __secondHeader__: HTML tag to be used as second header. Default: h4

Example:

```javascript
var editor = new MediumEditor('.editable', {
    anchorInputPlaceholder: 'Type a link',
    buttons: ['bold', 'italic', 'quote'],
    diffLeft: 25,
    diffTop: 10,
    firstHeader: 'h1',
    secondHeader: 'h2',
    delay: 1000
});
```

## Extra buttons

Medium Editor, by default, will show only the buttons listed above to avoid a huge toolbar. There are a couple of extra buttons you can use:

* __superscript__
* __subscript__
* __unorderedlist__
* __orderedlist__


## API

* __.deactivate()__: disables the editor
* __.activate()__: re-activates the editor


## Image Upload

[Pavel Linkesch](https://github.com/orthes) has developed a jQuery plugin to upload images following Medium.com functionality. Check it out at [http://orthes.github.io/medium-editor-images-plugin/](http://orthes.github.io/medium-editor-images-plugin/)


## Angular directive

[Thijs Wijnmaalen](https://github.com/thijsw) hacked together an AngularJS
directive. Check it out at
[https://github.com/thijsw/angular-medium-editor](https://github.com/thijsw/angular-medium-editor)

## Development

MediumEditor development tasks are managed by Grunt. To install all the necessary packages, just invoke:

```bash
npm install
```

These are the available grunt tasks:

* __js__: runs jslint and jasmine tests and creates minified and concatenated versions of the script;
* __css__: runs compass and csslint
* __test__: runs jasmine tests, jslint and csslint
* __watch__: watch for modifications on script/scss files

The source files are located inside the __src__ directory. MediumEditor stylesheet was created using sass/compass, make sure you have the compass gem installed on your system.

## Contributing

[![Stories in Ready](https://badge.waffle.io/daviferreira/medium-editor.png)](https://waffle.io/daviferreira/medium-editor)

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Test your changes to the best of your ability.
4. Update the documentation to reflect your changes if they add or changes current functionality.
5. Commit your changes (`git commit -am 'Added some feature'`)
6. Push to the branch (`git push origin my-new-feature`)
7. Create new Pull Request

## Contributors

```
 project  : medium-editor
 repo age : 6 months
 active   : 62 days
 commits  : 276
 files    : 29
 authors  :
   220	Davi Ferreira           79.7%
    14	Maxime de Visscher      5.1%
     8	Jarl Gunnar T. Flaten   2.9%
     8	Derek Odegard           2.9%
     8	Pedro Nasser            2.9%
     3	Troels Knak-Nielsen     1.1%
     3	Dmitri Cherniak         1.1%
     1	happyaccidents          0.4%
     1	muescha                 0.4%
     1	t_kjaergaard            0.4%
     1	typify                  0.4%
     1	Bitdeli Chef            0.4%
     1	waffleio                0.4%
     1	David Collien           0.4%
     1	Denis Gorbachev         0.4%
     1	Maxime Dantec           0.4%
     1	Nikita Korotaev         0.4%
     1	Noah Paessel            0.4%
     1	Tom MacWright           0.4%
```

## License

"THE BEER-WARE LICENSE" (Revision 42):

As long as you retain this notice you can do whatever you want with this stuff. If we meet some day, and you think this stuff is worth it, you can buy me a beer in return.


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/daviferreira/medium-editor/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

