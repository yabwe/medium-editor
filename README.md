# MediumEditor

[![Build Status](https://travis-ci.org/daviferreira/medium-editor.png?branch=master)](https://travis-ci.org/daviferreira/medium-editor)

This is a clone of [medium.com](https://medium.com) inline editor toolbar.

Since I always had problems with bloated editors and I loved the simplicity of medium.com solution I've tried to implement their WYSIWYG approach with this script.

MediumEditor has been written using vanilla JavaScript, no additional frameworks required.

Tested on Googe Chrome, Firefox and IE9+.

# Basic usage

![screenshot](https://raw.github.com/daviferreira/medium-editor/master/demo/img/medium-editor.jpg)

__demo__: [http://daviferreira.github.io/medium-editor/](http://daviferreira.github.io/medium-editor/)

First, you need to attach medium editor's stylesheet to your page:

```html
<link rel="stylesheet" href="css/medium.editor.css">
```

The next step is to reference the editor's script and instantiate a new MediumEditor object:

```html
<script src="js/medium.editor.js"></script>
<script>var editor = new MediumEditor('.editable');</script>
```

The above code will transform all the elements with the .editable class into HTML5 editable contents and add the medium editor toolbar to them.

You can also pass a list of HTML elements:

```javascript
var elements = document.querySelectorAll('.editable'),
    editor = new MediumEditor(elements);
```

## Initialization options

* __excludedActions__: list of actions to be excluded from the toolbar. Default: []
* __anchorInputPlaceholder__: text to be shown as placeholder of the anchor input. Default: _Paste or type a link_
* __diffLeft__: value in pixels to be added to the X axis positioning of the toolbar. Default: 0
* __diffTop__: value in pixels to be added to the Y axis positioning of the toolbar. Default: -5
* __firstHeader__: HTML tag to be used as first header. Default: h3
* __secondHeader__: HTML tag to be used as second header. Default: h4
* __delay__: time in milliseconds to show the toolbar. Default: 0

Example:

```javascript
var editor = new MediumEditor('.editable', {
    anchorInputPlaceholder: 'Type a link',
    diffLeft: 25,
    diffTop: 10,
    firstHeader: 'h1',
    secondHeader: 'h2',
    excludedActions: ['q', 's'],
    delay: 1000
});
```

## API

* __.deactivate()__: disables the editor
* __.activate()__: re-activates the editor

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

## License

"THE BEER-WARE LICENSE" (Revision 42):

As long as you retain this notice you can do whatever you want with this stuff. If we meet some day, and you think this stuff is worth it, you can buy me a beer in return.
