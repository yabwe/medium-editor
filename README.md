# MediumEditor

This is a clone of [medium.com](https://medium.com) inline editor toolbar.

MediumEditor has been written using vanilla JavaScript, no additional frameworks required.

## Browser Support

![IE](https://cloud.githubusercontent.com/assets/398893/3528325/20373e76-078e-11e4-8e3a-1cb86cf506f0.png) | ![Chrome](https://cloud.githubusercontent.com/assets/398893/3528328/23bc7bc4-078e-11e4-8752-ba2809bf5cce.png) | ![Firefox](https://cloud.githubusercontent.com/assets/398893/3528329/26283ab0-078e-11e4-84d4-db2cf1009953.png) | ![Opera](https://cloud.githubusercontent.com/assets/398893/3528330/27ec9fa8-078e-11e4-95cb-709fd11dac16.png) | ![Safari](https://cloud.githubusercontent.com/assets/398893/3528331/29df8618-078e-11e4-8e3e-ed8ac738693f.png)
--- | --- | --- | --- | --- |
IE 9+ ✔ | Latest ✔ | Latest ✔ | Latest ✔ | Latest ✔ |

[![NPM info](https://nodei.co/npm/medium-editor.png?downloads=true)](https://nodei.co/npm/medium-editor.png?downloads=true)

[![Travis build status](https://travis-ci.org/daviferreira/medium-editor.png?branch=master)](https://travis-ci.org/daviferreira/medium-editor)
[![dependencies](https://david-dm.org/daviferreira/medium-editor.png)](https://david-dm.org/daviferreira/medium-editor)
[![devDependency Status](https://david-dm.org/daviferreira/medium-editor/dev-status.png)](https://david-dm.org/daviferreira/medium-editor#info=devDependencies)

# Basic usage

![screenshot](https://raw.github.com/daviferreira/medium-editor/master/demo/img/medium-editor.jpg)

__demo__: [http://daviferreira.github.io/medium-editor/](http://daviferreira.github.io/medium-editor/)

### Installation

**Via bower:**

Run in your console: `bower install medium-editor`

**Manual installation:**

Download the [latest release](https://github.com/daviferreira/medium-editor/releases) and attach medium editor's stylesheets to your page:

```html
<link rel="stylesheet" href="css/medium-editor.css"> <!-- Core -->
<link rel="stylesheet" href="css/themes/default.css"> <!-- or any other theme -->
```

The next step is to reference the editor's script

```html
<script src="js/medium-editor.js"></script>
```

### Usage
You can now instantiate a new MediumEditor object:
```html
<script>var editor = new MediumEditor('.editable');</script>
```

The above code will transform all the elements with the .editable class into HTML5 editable contents and add the medium editor toolbar to them.

You can also pass a list of HTML elements:

```javascript
var elements = document.querySelectorAll('.editable'),
    editor = new MediumEditor(elements);
```

## IE9

If you want to support IE9, you will need to use a classList pollyfill, like Eli Grey's, available at [https://github.com/eligrey/classList.js](https://github.com/eligrey/classList.js).

## Initialization options

### Core options
* __allowMultiParagraphSelection__: enables the toolbar when selecting multiple paragraphs/block elements. Default: true
* __cleanPastedHTML__: cleans pasted content from different sources, like google docs etc. Default: false
* __delay__: time in milliseconds to show the toolbar or anchor tag preview. Default: 0
* __disableReturn__:  enables/disables the use of the return-key. You can also set specific element behavior by using setting a data-disable-return attribute. Default: false
* __disableDoubleReturn__:  allows/disallows two (or more) empty new lines. You can also set specific element behavior by using setting a data-disable-double-return attribute. Default: false
* __disableEditing__: enables/disables adding the contenteditable behavior. Useful for using the toolbar with customized buttons/actions. You can also set specific element behavior by using setting a data-disable-editing attribute. Default: false
* __disablePlaceholders__: enables/disables support for __placeholder__, including DOM element creation and attaching event handlers.  When disabled, medium-editor will ignore the __placholder__ option and not show placeholder text. Default: false
* __elementsContainer__: specifies a DOM node to contain MediumEditor's toolbar and anchor preview elements. Default: document.body
* __extensions__: extension to use (see _Extensions_) for more. Default: {}
* __firstHeader__: HTML tag to be used as first header. Default: h3
* __forcePlainText__: Forces pasting as plain text. Default: true
* __imageDragging__: Allows image drag and drop into the editor. Default: true
* __placeholder__: Defines the default placeholder for empty contenteditables when __disablePlaceholders__ is not set to true. You can overwrite it by setting a data-placeholder attribute on your elements. Default: 'Type your text'
* __secondHeader__: HTML tag to be used as second header. Default: h4
* __standardizeSelectionStart__: Standardizes how the beginning of a range is decided between browsers whenever the selected text is analyzed for updating toolbar buttons status

### Toolbar options
* __activeButtonClass__: CSS class added to active buttons in the toolbar. Default: 'medium-editor-button-active'
* __buttons__: the set of buttons to display on the toolbar. Default: ['bold', 'italic', 'underline', 'anchor', 'header1', 'header2', 'quote']
* __buttonLabels__: type of labels on the buttons. Values: 'fontawesome', `{'bold': '<b>b</b>', 'italic': '<i>i</i>'}`. Default: false
* __diffLeft__: value in pixels to be added to the X axis positioning of the toolbar. Default: 0
* __diffTop__: value in pixels to be added to the Y axis positioning of the toolbar. Default: -10
* __disableToolbar__: enables/disables the toolbar, adding only the contenteditable behavior. You can also set specific element behavior by using setting a data-disable-toolbar attribute. Default: false
* __firstButtonClass__: CSS class added to the first button in the toolbar. Default: 'medium-editor-button-first'
* __lastButtonClass__: CSS class added to the last button in the toolbar. Default: 'medium-editor-button-last'
* __onShowToolbar__: optional callback that will be called each time the toolbar is actually shown for this instance of medium-editor.
* __onHideToolbar__: optional callback that will be called each time the toolbar is actually hidden for this instance of medium-editor.
* __staticToolbar__: enable/disable the toolbar always displaying in the same location relative to the medium-editor element. Default: false
* __stickyToolbar__: enable/disable the toolbar "sticking" to the medium-editor element when the page is being scrolled. Default: false
* __toolbarAlign__: `left`|`center`|`right` - Aligns the toolbar relative to the medium-editor element.
* __updateOnEmptySelection__: update the state of the toolbar buttons even when the selection is collapse (there is no selection, just a cursor). Default: false

### Anchor form options
* __anchorButton__: enables/disables adding class __anchorButtonClass__ to anchor tags. Default: false
* __anchorButtonClass__: class to add to anchor tags, when __anchorButton__ is set to true. Default: btn
* __anchorInputPlaceholder__: text to be shown as placeholder of the anchor input. Default: _Paste or type a link_
* __anchorInputCheckboxLabel__: text to be shown for the anchor new window target. Default: _Open in new window_
* __anchorPreviewHideDelay__: time in milliseconds to show the anchor tag preview after the mouse has left the anchor tag. Default: 500
* __checkLinkFormat__: enables/disables check for common URL protocols on anchor links. Default: false
* __disableAnchorForm__: enables/disables the built-in anchor url collection ux, including DOM element creation and attaching event handlers.  When disabled, medium-editor will not automatically handle collecting a url if a 'anchor' button is included in the toolbar. Default: false
* __targetBlank__: enables/disables target="\_blank" for anchor tags. Default: false

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
* __justifyLeft__
* __justifyFull__
* __justifyCenter__
* __justifyRight__
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

To add additional functions that are not supported by the native [browser API](https://developer.mozilla.org/en/docs/Rich-Text_Editing_in_Mozilla) you can
write extensions that are then integrated into the toolbar. The Extension API is currently unstable and very minimal.

An extension is an object that has essentially three functions `getButton`, `getForm` and `checkState`.

* `getButton` is called when the editor is initialized and should return an element that is integrated into the toolbar.
  Usually this will be a `<button>` element like the ones Medium Editor uses. All event handling on this button is
  _entirely up to you_ so you should either keep a reference or bind your eventhandlers before returning it. You can
  also return a HTML-String that is then integrated into the toolbar also this is not really useful.

* `getForm` is called when the editor is initialized and should return an element that is integrated into the toolbar.
  Usually this will be a `<div>` element that would contain some `input` elements. Handling the saving and canceling of the form is _entirely up to you_ so you should either keep a reference or bind your eventhandlers before returning it.

* `checkState` is called whenever a user selects some text in the area where the Medium Editor instance is running. It's
  responsability is to toggle the current _state_ of the button. I.e. marking is a _on_ or _off_. Again the method on how
  determine the state is entirely up to you. `checkState` will be called multiple times and will receive a [DOM `Element`](https://developer.mozilla.org/en-US/docs/Web/API/element)
  as parameter.

Properties

* `parent` add this property to your extension class constructor and set it to `true` to be able to access the Medium Editor instance through the `base` property that will be set during the initialization

* `hasForm` add this property to your extension class constructor and set it to `true` to tell Medium Editor that your extension contains a form. Medium editor will handle opening the form for you on your extension's button click.

### Examples

A simple example the uses [rangy](https://code.google.com/p/rangy/) and the [CSS Class Applier Module](https://code.google.com/p/rangy/wiki/CSSClassApplierModule) to support highlighting of text:

```js
rangy.init();

function Highlighter() {
    this.button = document.createElement('button');
    this.button.className = 'medium-editor-action';
    this.button.textContent = 'H';
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
  this.button.textContent = 'X';
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

A simple table example that uses the `hasForm` attribute:

```js
function Table(options) {
    this.parent = true;
    this.hasForm = true;
    this.options = options;
}

Table.prototype.init = function() {
    this.createButton();
    this.createForm();
};

Table.prototype.createButton = function() {
    this.button = document.createElement('button');
    this.button.className = 'medium-editor-action';
    this.button.textContent = 'T';
    if(this.base.options.buttonLabels === 'fontawesome'){
        this.button.innerHTML = '<i class="fa fa-table"></i>';
    }
    this.button.onclick = this.onClick.bind(this);
};

Table.prototype.createForm = function() {
    this.form = document.createElement('div'),
    this.close = document.createElement('a'),
    this.save = document.createElement('a'),
    this.columnInput = document.createElement('input'),
    this.rowInput = document.createElement('input');

    this.close.setAttribute('href', '#');
    this.close.innerHTML = '&times;';
    this.close.onclick = this.onClose.bind(this);

    this.save.setAttribute('href', '#');
    this.save.innerHTML = '&#10003;';
    this.save.onclick = this.onSave.bind(this);

    this.columnInput.setAttribute('type', 'text');
    // Add the input CSS class for correct styling
    this.columnInput.className = 'medium-editor-toolbar-input';
    this.columnInput.setAttribute('placeholder', 'Column Count');

    this.rowInput.setAttribute('type', 'text');
    // Add the input CSS class for correct styling
    this.rowInput.className = 'medium-editor-toolbar-input';
    this.rowInput.setAttribute('placeholder', 'Row Count');

    this.form.appendChild(this.columnInput);
    this.form.appendChild(this.rowInput);

    this.form.appendChild(this.save);
    this.form.appendChild(this.close);
};

Table.prototype.getButton = function() {
    return this.button;
};

Table.prototype.getForm = function() {
    return this.form;
};

Table.prototype.onClick = function() {
    this.columnInput.value = this.options.defaultColumns;
    this.rowInput.value = this.options.defaultRows;
};

Table.prototype.onClose = function(e) {
    e.preventDefault();
    this.base.hideForm(this.form);
};

Table.prototype.onSave = function(e) {
    e.preventDefault();
    var columnCount = this.columnInput.value;
    var rowCount = this.rowInput.value;
    var table = this.createTable(columnCount, rowCount);

    this.base.pasteHTML(table.innerHTML);
    this.base.hideForm(this.form);
};

// Create the table element.
Table.prototype.createTable = function(cols, rows) {
    var table = document.createElement('table'),
        header = document.createElement('thead'),
        headerRow = document.createElement('tr'),
        body = document.createElement('tbody'),
        wrap = document.createElement('div');

    for (var h = 1; h <= cols; h++) {
        var headerCol = document.createElement('th');
        headerCol.innerHTML = '...';
        headerRow.appendChild(headerCol);
    }

    header.appendChild(headerRow);

    for (var r = 1; r <= rows; r++) {
        var bodyRow = document.createElement('tr');
        for (var c = 1; c <= this.options.defaultColumns; c++) {
            var bodyCol = document.createElement('td');
            bodyCol.innerHTML = '...';
            bodyRow.appendChild(bodyCol);
        }
        body.appendChild(bodyRow);
    }

    table.appendChild(header);
    table.appendChild(body);
    wrap.appendChild(table);

    return wrap;
};

// When creating your Medium Editor
var editor = new MediumEditor('.editable', {
    buttons: ['table'],
    extensions: {
        'table': new Table({
            defaultColumns: 3,
            defaultRows: 2
        }),
});
```

## Image Upload & embeds

[Pavel Linkesch](https://github.com/orthes) has developed a jQuery plugin to upload images & embed content (from Twitter, Youtube, Vimeo, etc.) following Medium.com functionality. Check it out at [http://orthes.github.io/medium-editor-insert-plugin/](http://orthes.github.io/medium-editor-insert-plugin/)

## Markdown

[Ionică Bizău](https://github.com/IonicaBizau) has created a Medium Editor extension, named [Medium Editor Markdown](https://github.com/IonicaBizau/medium-editor-markdown), to add the functionality to render the HTML into Markdown code. Check it out at [https://github.com/IonicaBizau/medium-editor-markdown](https://github.com/IonicaBizau/medium-editor-markdown).

## Inserting custom HTML
At [**@jillix**](https://github.com/jillix/), [Ionică Bizău](https://github.com/IonicaBizau) developed [a Medium Editor extension](https://github.com/jillix/medium-editor-custom-html) that allows inserting custom HTML into the editor. Check it out here: [https://github.com/jillix/medium-editor-custom-html](https://github.com/jillix/medium-editor-custom-html).

## Laravel

[Zvonko Biškup](https://github.com/codeforest) has written an [awesome tutorial](http://www.codeforest.net/laravel-wysiwyg-editor) about how to integrate MediumEditor into your Laravel Project.

## Rails Gem

[Ahmet Sezgin Duran](https://github.com/marjinal1st/) gemified Medium Editor for Rails asset pipeline, check it out at [https://github.com/marjinal1st/medium-editor-rails](https://github.com/marjinal1st/medium-editor-rails).

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
 repo age : 1 year, 8 months
 active   : 233 days
 commits  : 804
 files    : 62
 authors  :
   520	Davi Ferreira           64.7%
    30	Andy Yaco-Mink          3.7%
    30	Nate Mielnik            3.7%
    20	Maxime de Visscher      2.5%
    18	Noah Chase              2.2%
     8	Derek Odegard           1.0%
     8	Jarl Gunnar T. Flaten   1.0%
     8	Pedro Nasser            1.0%
     8	Seif                    1.0%
     7	Aidan Threadgold        0.9%
     7	Alfonso (the fonz) de la Osa 0.9%
     7	Charl Gottschalk        0.9%
     7	OmniaGM                 0.9%
     6	Dayjo                   0.7%
     6	Pascal                  0.7%
     5	Martin Thurau           0.6%
     5	Raul Matei              0.6%
     4	Sebastian Zuchmanski    0.5%
     4	minikomi                0.5%
     3	Andrew Hubbs            0.4%
     3	Brian Reavis            0.4%
     3	Dmitri Cherniak         0.4%
     3	Javier Marín            0.4%
     3	Nikita Korotaev         0.4%
     3	Patrick Cavanaugh       0.4%
     3	Pavel Linkesch          0.4%
     3	Troels Knak-Nielsen     0.4%
     3	arol                    0.4%
     3	ʞuıɯ-oɔɐʎ ʎpuɐ          0.4%
     2	Alexander Hofbauer      0.2%
     2	Ethan Turkeltaub        0.2%
     2	Jacob Magnusson         0.2%
     2	Jeremy                  0.2%
     2	Joel                    0.2%
     2	Karl Sander             0.2%
     2	Son Tran-Nguyen         0.2%
     2	jj                      0.2%
     2	mako                    0.2%
     1	Adam Mulligan           0.1%
     1	Alberto Gasparin        0.1%
     1	Bitdeli Chef            0.1%
     1	Brooke McKim            0.1%
     1	Bruno Peres             0.1%
     1	Carlos Alexandre Fuechter 0.1%
     1	Cenk Dölek             0.1%
     1	Dave Jarvis             0.1%
     1	David Collien           0.1%
     1	David Hellsing          0.1%
     1	Denis Gorbachev         0.1%
     1	Diana Liao              0.1%
     1	Enrico Berti            0.1%
     1	Harshil Shah            0.1%
     1	IndieSquidge            0.1%
     1	Ionică Bizău            0.1%
     1	Jack Parker             0.1%
     1	Jeff Bellsey            0.1%
     1	Jeff Welch              0.1%
     1	Johann Troendle         0.1%
     1	Mark Kraemer            0.1%
     1	Max                     0.1%
     1	Maxime Dantec           0.1%
     1	Maxime De Visscher      0.1%
     1	Michael Kay             0.1%
     1	Moore Adam              0.1%
     1	Nic Malan               0.1%
     1	Nick Semenkovich        0.1%
     1	Noah Paessel            0.1%
     1	Patrick Kempff          0.1%
     1	Peleg Rosenthal         0.1%
     1	Randson Oliveira        0.1%
     1	Richard Park            0.1%
     1	Robert Koritnik         0.1%
     1	Sarah Squire            0.1%
     1	Scott Carleton          0.1%
     1	Søren Torp Petersen     0.1%
     1	Tom MacWright           0.1%
     1	happyaccidents          0.1%
     1	mako yass               0.1%
     1	mbrookes                0.1%
     1	muescha                 0.1%
     1	shaohua                 0.1%
     1	t_kjaergaard            0.1%
     1	typify                  0.1%
     1	valentinnew             0.1%
     1	waffleio                0.1%
     1	zzjin                   0.1%
```

## License

"THE BEER-WARE LICENSE" (Revision 42):

As long as you retain this notice you can do whatever you want with this stuff. If we meet some day, and you think this stuff is worth it, you can buy me a beer in return.
