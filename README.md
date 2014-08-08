# MediumEditor

This is a clone of [medium.com](https://medium.com) inline editor toolbar.

Since I always had problems with bloated editors and I loved the simplicity of medium.com solution I've tried to implement their WYSIWYG approach with this script.

MediumEditor has been written using vanilla JavaScript, no additional frameworks required.

Tested on Google Chrome, Firefox and IE9+.

[![NPM info](https://nodei.co/npm/medium-editor.png?downloads=true)](https://nodei.co/npm/medium-editor.png?downloads=true)

[![Travis build status](https://travis-ci.org/daviferreira/medium-editor.png?branch=master)](https://travis-ci.org/daviferreira/medium-editor)
[![dependencies](https://david-dm.org/daviferreira/medium-editor.png)](https://david-dm.org/daviferreira/medium-editor)
[![devDependency Status](https://david-dm.org/daviferreira/medium-editor/dev-status.png)](https://david-dm.org/daviferreira/medium-editor#info=devDependencies)

# Basic usage

![screenshot](https://raw.github.com/daviferreira/medium-editor/master/demo/img/medium-editor.jpg)

__demo__: [http://daviferreira.github.io/medium-editor/](http://daviferreira.github.io/medium-editor/)

First, you need to attach medium editor's stylesheet to your page:

```html
<link rel="stylesheet" href="css/medium-editor.css"> <!-- Core -->
<link rel="stylesheet" href="css/themes/default.css"> <!-- or any other theme -->
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

## IE9

If you want to support IE9, you will need to use a classList pollyfill, like Eli Gray's, available at [https://github.com/eligrey/classList.js](https://github.com/eligrey/classList.js).

## Initialization options

* __allowMultiParagraphSelection__: enables the toolbar when selecting multiple paragraphs/block elements. Default: true
* __anchorInputPlaceholder__: text to be shown as placeholder of the anchor input. Default: _Paste or type a link_
* __anchorPreviewHideDelay__: time in milliseconds to show the anchor tag preview after the mouse has left the anchor tag. Default: 500
* __buttons__: the set of buttons to display on the toolbar. Default: ['bold', 'italic', 'underline', 'anchor', 'header1', 'header2', 'quote']
* __buttonLabels__: type of labels on the buttons. Values: 'fontawesome', `{'bold': '<b>b</b>', 'italic': '<i>i</i>'}`. Default: false
* __checkLinkFormat__: enables/disables check for common URL protocols on anchor links. Default: false
* __cleanPastedHTML__: cleans pasted content from different sources, like google docs etc. Default: false
* __delay__: time in milliseconds to show the toolbar or anchor tag preview. Default: 0
* __diffLeft__: value in pixels to be added to the X axis positioning of the toolbar. Default: 0
* __diffTop__: value in pixels to be added to the Y axis positioning of the toolbar. Default: -10
* __disableReturn__:  enables/disables the use of the return-key. You can also set specific element behavior by using setting a data-disable-return attribute. Default: false
* __disableDoubleReturn__:  allows/disallows two (or more) empty new lines. You can also set specific element behavior by using setting a data-disable-double-return attribute. Default: false
* __disableToolbar__: enables/disables the toolbar, adding only the contenteditable behavior. You can also set specific element behavior by using setting a data-disable-toolbar attribute. Default: false
* __disableEditing__: enables/disables adding the contenteditable behavior. Useful for using the toolbar with customized buttons/actions. You can also set specific element behavior by using setting a data-disable-editing attribute. Default: false
* __elementsContainer__: specifies a DOM node to contain MediumEditor's toolbar and anchor preview elements. Default: document.body
* __firstHeader__: HTML tag to be used as first header. Default: h3
* __forcePlainText__: Forces pasting as plain text. Default: true
* __placeholder__: Defines the default placeholder for empty contenteditables. You can overwrite it by setting a data-placeholder attribute on your elements. Default: 'Type your text'
* __secondHeader__: HTML tag to be used as second header. Default: h4
* __targetBlank__: enables/disables target="\_blank" for anchor tags. Default: false
* __extensions__: extension to use (see _Extensions_) for more. Default: {}
* __activeButtonClass__: CSS class added to active buttons. Default: 'medium-editor-button-active'
* __firstButtonClass__: CSS class added to the first button. Default: 'medium-editor-button-first'
* __lastButtonClass__: CSS class added to the last button. Default: 'medium-editor-button-last'

Example:

```javascript
var editor = new MediumEditor('.editable', {
    anchorInputPlaceholder: 'Type a link',
    buttons: ['bold', 'italic', 'quote'],
    diffLeft: 25,
    diffTop: 10,
    firstHeader: 'h1',
    secondHeader: 'h2',
    delay: 1000,
    targetBlank: true
});
```

## Extra buttons

Medium Editor, by default, will show only the buttons listed above to avoid a huge toolbar. There are a couple of extra buttons you can use:

* __superscript__
* __subscript__
* __strikethrough__
* __unorderedlist__
* __orderedlist__
* __pre__
* __image__ (this simply converts selected text to an image tag)
* __indent__ (moves the selected text up one level)
* __outdent__ (moves the selected text down one level)


## Themes

Check out the Wiki page for a list of available themes: [https://github.com/daviferreira/medium-editor/wiki/Themes](https://github.com/daviferreira/medium-editor/wiki/Themes)

## API

* __.deactivate()__: disables the editor
* __.activate()__: re-activates the editor
* __.serialize()__: returns a JSON object with elements contents


## Capturing DOM changes

For observing any changes on contentEditable

```js
$('.editable').on('input', function() {
  // Do some work
});
```

This is handy when you need to capture modifications other thats outside of `key up`'s scope like clicking on toolbar buttons.

`input` is supported by Chrome, Firefox, IE9 and other modern browsers. If you want to read more or support older browsers, check [Listening to events of a contenteditable HTML element](http://stackoverflow.com/questions/7802784/listening-to-events-of-a-contenteditable-html-element/7804973#7804973) and [Detect changes in the DOM](http://stackoverflow.com/questions/3219758/detect-changes-in-the-dom)

## MediumButton

Patrick Stillhar developed a new and improved way to add buttons to our toolbar. Check it out at:
[https://stillhart.biz/project/MediumButton/](https://stillhart.biz/project/MediumButton/)

## Extensions

To add additional additional functions that are not supported by the native [browser API](https://developer.mozilla.org/de/docs/Rich-Text_Editing_in_Mozilla) you can
write extensions that are then integrated into the toolbar. The Extension API is currently unstable and very minimal.

An extension is an object that has essentially two functions `getButton` and `checkState`.

* `getButton` is called when the editor is initialized and should return a element that is integrated into the toolbar.
  Usually this will be a `<button>` element like the onces Medium Editor uses. All event handling on this button is
  _entirely up to you_ so you should either keep a reference or bind your eventhandlers before returning it. You can
  also return a HTML-String that is then integrated into the toolbar also this is not really useful.

* `checkState` is called whenever a user selects some text in the area where the Medium Editor instance is running. It's
  responsability is to toggle the current _state_ of the button. I.e. marking is a _on_ or _off_. Again the method on how
  determine the state is entirely up to you. `checkState` will be called multiple times and will receive a [DOM `Element`](https://developer.mozilla.org/en-US/docs/Web/API/element)
  as parameter.

Properties

* `parent` add this property to your extension class constructor and set it to true to be able to access the Medium Editor instance through the `base` property that will be set during the initialization

### Examples

A simple example the uses [rangy](https://code.google.com/p/rangy/) and the [CSS Class Applier Module](https://code.google.com/p/rangy/wiki/CSSClassApplierModule) to support highlighting of text:

```js
rangy.init();

function Highlighter() {
    this.button = document.createElement('button');
    this.button.className = 'medium-editor-action';
    this.button.innerText = 'H';
    this.button.onclick = this.onClick.bind(this);
    this.classApplier = rangy.createCssClassApplier("highlight", {
        elementTagName: 'mark',
        normalize: true
    });
}
Highlighter.prototype.onClick = function() {
    this.classApplier.toggleSelection();
};
Highlighter.prototype.getButton = function() {
    return this.button;
};
Highlighter.prototype.checkState = function (node) {
    if(node.tagName == 'MARK') {
        this.button.classList.add('medium-editor-button-active');
    }
};

var e = new MediumEditor('.editor', {
    buttons: ['highlight', 'bold', 'italic', 'underline'],
    extensions: {
        'highlight': new Highlighter()
    }
});
```

A simple example that uses the `parent` attribute:

```js
function Extension() {
  this.parent = true;

  this.button = document.createElement('button');
  this.button.className = 'medium-editor-action';
  this.button.innerText = 'X';
  this.button.onclick = this.onClick.bind(this);
}

Extension.prototype.getButton = function() {
  return this.button;
};

Extension.prototype.onClick = function() {
  alert('This is editor: #' + this.base.id);
};

var one = new MediumEditor('.one', {
    buttons: ['extension'],
    extensions: {
      extension: new Extension()
    }
});

var two = new MediumEditor('.two', {
    buttons: ['extension'],
    extensions: {
      extension: new Extension()
    }
});
```

## Image Upload

[Pavel Linkesch](https://github.com/orthes) has developed a jQuery plugin to upload images following Medium.com functionality. Check it out at [http://orthes.github.io/medium-editor-insert-plugin/](http://orthes.github.io/medium-editor-insert-plugin/)

## Laravel

[Zvonko Biškup](https://github.com/codeforest) has written an [awesome tutorial](http://www.codeforest.net/laravel-wysiwyg-editor) about how to integrate MediumEditor into your Laravel Project.

## Rails Gem

[Ahmet Sezgin Duran](https://github.com/marjinal1st/)  gemified Medium Editor for Rails asset pipeline, check it out at [https://github.com/marjinal1st/medium-editor-rails](https://github.com/marjinal1st/medium-editor-rails).

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
* __css__: runs autoprefixer and csslint
* __test__: runs jasmine tests, jslint and csslint
* __watch__: watch for modifications on script/scss files

The source files are located inside the __src__ directory.

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
 repo age : 11 months
 active   : 145 days
 commits  : 535
 files    : 56
 authors  :
   396	Davi Ferreira           74.0%
    20	Maxime de Visscher      3.7%
    12	Andy Yaco-Mink          2.2%
     8	Derek Odegard           1.5%
     8	Jarl Gunnar T. Flaten   1.5%
     8	Pedro Nasser            1.5%
     8	Seif                    1.5%
     5	Martin Thurau           0.9%
     5	OmniaGM                 0.9%
     4	Sebastian Zuchmanski    0.7%
     4	minikomi                0.7%
     3	Andrew Hubbs            0.6%
     3	Dmitri Cherniak         0.6%
     3	Nikita Korotaev         0.6%
     3	Troels Knak-Nielsen     0.6%
     3	arol                    0.6%
     3	ʞuıɯ-oɔɐʎ ʎpuɐ          0.6%
     2	Ethan Turkeltaub        0.4%
     2	Jacob Magnusson         0.4%
     2	mako                    0.4%
     1	Adam Mulligan           0.2%
     1	Alberto Gasparin        0.2%
     1	Bitdeli Chef            0.2%
     1	Cenk Dölek             0.2%
     1	David Collien           0.2%
     1	David Hellsing          0.2%
     1	Denis Gorbachev         0.2%
     1	Diana Liao              0.2%
     1	Jack Parker             0.2%
     1	Jeff Welch              0.2%
     1	Mark Kraemer            0.2%
     1	Max                     0.2%
     1	Maxime Dantec           0.2%
     1	Maxime De Visscher      0.2%
     1	Michael Kay             0.2%
     1	Moore Adam              0.2%
     1	Nic Malan               0.2%
     1	Noah Paessel            0.2%
     1	Pavel Linkesch          0.2%
     1	Robert Koritnik         0.2%
     1	Sarah Squire            0.2%
     1	Scott Carleton          0.2%
     1	Søren Torp Petersen     0.2%
     1	Tom MacWright           0.2%
     1	happyaccidents          0.2%
     1	mako yass               0.2%
     1	mbrookes                0.2%
     1	muescha                 0.2%
     1	shaohua                 0.2%
     1	t_kjaergaard            0.2%
     1	typify                  0.2%
     1	waffleio                0.2%
     1	zzjin                   0.2%
```

## License

"THE BEER-WARE LICENSE" (Revision 42):

As long as you retain this notice you can do whatever you want with this stuff. If we meet some day, and you think this stuff is worth it, you can buy me a beer in return.
