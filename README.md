# MediumEditor

[![Join the chat at https://gitter.im/daviferreira/medium-editor](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/daviferreira/medium-editor?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

This is a clone of [medium.com](https://medium.com) inline editor toolbar.

MediumEditor has been written using vanilla JavaScript, no additional frameworks required.

## Browser Support

[![Sauce Test Status](https://saucelabs.com/browser-matrix/mediumeditor.svg)](https://saucelabs.com/u/mediumeditor)

![Supportd Browsers](https://cloud.githubusercontent.com/assets/2444240/7519189/a819e426-f4ad-11e4-8740-626396c5d61b.png)

[![NPM info](https://nodei.co/npm/medium-editor.png?downloads=true)](https://www.npmjs.com/package/medium-editor)

[![Travis build status](http://img.shields.io/travis/daviferreira/medium-editor/master.svg?style=flat-square)](https://travis-ci.org/daviferreira/medium-editor)
[![dependencies](http://img.shields.io/david/daviferreira/medium-editor.svg?style=flat-square)](https://david-dm.org/daviferreira/medium-editor)
[![devDependency Status](http://img.shields.io/david/dev/daviferreira/medium-editor.svg?style=flat-square)](https://david-dm.org/daviferreira/medium-editor#info=devDependencies)
[![Coverage Status](http://img.shields.io/coveralls/daviferreira/medium-editor.svg?style=flat-square)](https://coveralls.io/r/daviferreira/medium-editor?branch=master)

# Basic usage

![screenshot](https://raw.github.com/daviferreira/medium-editor/master/demo/img/medium-editor.jpg)

__demo__: [http://daviferreira.github.io/medium-editor/](http://daviferreira.github.io/medium-editor/)

### Installation

**Via npm:**

Run in your console: `npm install medium-editor`

**Via bower:**

`bower install medium-editor`

**Manual installation:**

Download the [latest release](https://github.com/daviferreira/medium-editor/releases) and attach medium editor's stylesheets to your page:

```html
<link rel="stylesheet" href="css/medium-editor.css"> <!-- Core -->
<link rel="stylesheet" href="css/themes/default.css"> <!-- or any other theme -->
```

### Usage

The next step is to reference the editor's script

```html
<script src="js/medium-editor.js"></script>
```

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

MediumEditor also supports textarea. If you provide a textarea element, the script will create a new div with `contentEditable=true`, hide the textarea and link the textarea value to the div HTML content.

## Initialization options

### Core options
* __allowMultiParagraphSelection__: enables the toolbar when selecting multiple paragraphs/block elements. Default: true
* __delay__: time in milliseconds to show the toolbar or anchor tag preview. Default: 0
* __disableAnchorPreview__: enables/disables the anchor preview element, which appears when hovering links and allows the user to edit the link when clicking. If toolbar is diabled (via __disableToolbar__ or `data-disable-toolbar attribute`) the anchor preview is always disabled so this option will be ignored. Default: false
* __autoLink__: enables/disables the auto-link feature, which automatically turns URLs entered into the text field into HTML anchor tags (similar to the functionality of Markdown). Default: false
* __disableReturn__:  enables/disables the use of the return-key. You can also set specific element behavior by using setting a data-disable-return attribute. Default: false
* __disableDoubleReturn__:  allows/disallows two (or more) empty new lines. You can also set specific element behavior by using setting a data-disable-double-return attribute. Default: false
* __disableEditing__: enables/disables adding the contenteditable behavior. Useful for using the toolbar with customized buttons/actions. You can also set specific element behavior by using setting a data-disable-editing attribute. Default: false
* __disablePlaceholders__: enables/disables support for __placeholder__, including DOM element creation and attaching event handlers.  When disabled, medium-editor will ignore the __placeholder__ option and not show placeholder text. Default: false
* __elementsContainer__: specifies a DOM node to contain MediumEditor's toolbar and anchor preview elements. Default: document.body
* __extensions__: extension to use (see [Custom Buttons and Extensions](https://github.com/daviferreira/medium-editor/wiki/Custom-Buttons-and-Extensions)) for more. Default: {}
* __firstHeader__: HTML tag to be used as first header. Default: h3
* __imageDragging__: Allows image drag and drop into the editor. Default: true
* __placeholder__: Defines the default placeholder for empty contenteditables when __disablePlaceholders__ is not set to true. You can overwrite it by setting a data-placeholder attribute on your elements. Default: 'Type your text'
* __secondHeader__: HTML tag to be used as second header. Default: h4
* __spellcheck__: Enable/disable native contentEditable automatic spellcheck. Default: true
* __standardizeSelectionStart__: Standardizes how the beginning of a range is decided between browsers whenever the selected text is analyzed for updating toolbar buttons status

### Toolbar options
* __activeButtonClass__: CSS class added to active buttons in the toolbar. Default: 'medium-editor-button-active'
* __buttons__: the set of buttons to display on the toolbar. Default: `['bold', 'italic', 'underline', 'anchor', 'header1', 'header2', 'quote']`
* __buttonLabels__: type of labels on the buttons. Values: 'fontawesome', `{'bold': '<b>b</b>', 'italic': '<i>i</i>'}`. Default: false
* __diffLeft__: value in pixels to be added to the X axis positioning of the toolbar. Default: 0
* __diffTop__: value in pixels to be added to the Y axis positioning of the toolbar. Default: -10
* __disableToolbar__: enables/disables the toolbar, adding only the contenteditable behavior. You can also set specific element behavior by using setting a `data-disable-toolbar` attribute. Default: false
* __firstButtonClass__: CSS class added to the first button in the toolbar. Default: 'medium-editor-button-first'
* __lastButtonClass__: CSS class added to the last button in the toolbar. Default: 'medium-editor-button-last'
* __onShowToolbar__: optional callback that will be called each time the toolbar is actually shown for this instance of medium-editor.
* __onHideToolbar__: optional callback that will be called each time the toolbar is actually hidden for this instance of medium-editor.
* __staticToolbar__: enable/disable the toolbar always displaying in the same location relative to the medium-editor element. Default: false
* __stickyToolbar__: enable/disable the toolbar "sticking" to the medium-editor element when the page is being scrolled. Default: false
* __toolbarAlign__: `left`|`center`|`right` - when using the __staticToolbar__ option, this aligns the static toolbar relative to the medium-editor element. Default: `center`
* __updateOnEmptySelection__: update the state of the toolbar buttons even when the selection is collapse (there is no selection, just a cursor). Default: false

### Anchor form options
* __anchorButton__: enables/disables displaying a checkbox for whether the user wants the link to be displayed as a "button". If checkbox is checked, the created link will have __anchorButtonClass__ added to the class list. Default: false
* __anchorButtonClass__: class to add to anchor tags, when __anchorButton__ is set to true. Default: btn
* __anchorTarget__: enables/disables displaying a "Open in new window" checkbox, which when checked changes the `target` attribute of the created link. Default: false
* __anchorInputCheckboxLabel__: text to be shown in the checkbox enabled via the __anchorTarget__ option. Default: _Open in new window_
* __anchorInputPlaceholder__: text to be shown as placeholder of the anchor input. Default: _Paste or type a link_
* __anchorPreviewHideDelay__: time in milliseconds to show the anchor tag preview after the mouse has left the anchor tag. Default: 500
* __checkLinkFormat__: enables/disables check for common URL protocols on anchor links. Default: false
* __targetBlank__: enables/disables target="\_blank" for anchor tags. Default: false

### Paste Options
Options for paste are passed as an object that is a member of the outer options object. Example:
```javascript
var editor = new MediumEditor('.editable', {
    buttons: ['bold', 'italic', 'quote'],
    paste: {
        // This example includes the default options for paste, if nothing is passed this is what it used
        forcePlainText: true,
        cleanPastedHTML: false,
        cleanReplacements: [],
        cleanAttrs: ['class', 'style', 'dir'],
        cleanTags: ['meta']
    }
});
```

* __forcePlainText__: Forces pasting as plain text. Default: true
* __cleanPastedHTML__: cleans pasted content from different sources, like google docs etc. Default: false
* __cleanReplacements__: custom pairs (2 element arrays) of RegExp and replacement text to use during paste when __forcePlainText__ or __cleanPastedHTML__ are `true` OR when calling `cleanPaste(text)` helper method. Default: []
* __cleanAttrs__: list of element attributes to remove during paste when __cleanPastedHTML__ is `true` or when calling `cleanPaste(text)` or `pasteHTML(html,options)` helper methods. Default: ['class', 'style', 'dir']
* __cleanTags__: list of element tag names to remove during paste when __cleanPastedHTML__ is `true` or when calling `cleanPaste(text)` or `pasteHTML(html,options)` helper methods. Default: ['meta']

### Options Example:

```javascript
var editor = new MediumEditor('.editable', {
    anchorInputPlaceholder: 'Type a link',
    buttons: ['bold', 'italic', 'quote'],
    diffLeft: 25,
    diffTop: 10,
    firstHeader: 'h1',
    secondHeader: 'h2',
    delay: 1000,
    targetBlank: true,
    paste: {
        cleanPastedHTML: true,
        cleanAttrs: ['style', 'dir'],
        cleanTags: ['label', 'meta']
    }
});
```

## Extra buttons

Medium Editor, by default, will show only the buttons listed above to avoid a huge toolbar. There are a few extra buttons you can use:

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
* __removeFormat__ (clears inline style formatting, preserves blocks)


## Themes

Check out the Wiki page for a list of available themes: [https://github.com/daviferreira/medium-editor/wiki/Themes](https://github.com/daviferreira/medium-editor/wiki/Themes)

## API

### Core Methods
* __.destroy()__: tears down the editor if already setup, removing all DOM elements and event handlers
* __.setup()__: rebuilds the editor if it has already been destroyed, recreating DOM elements and attaching event handlers
* __.serialize()__: returns a JSON object with elements contents
* __.execAction(action, opts)__: executes an built-in action via `document.execCommand`
* __.createLink(opts)__: creates a link via the native `document.execCommand('createLink')` command
* __.subscribe(event, listener)__: attaches a listener to a custom medium-editor event
* __.unsubscribe(event, listener)__: detaches a listener from a custom medium-editor event
* __.saveSelection()__: internally store the set of selected text
* __.restoreSelection()__: restore the selection to what was selected when `saveSelection()` was called
* __.selectAllContents()__: expands the selection to contain all text within the focused contenteditable
* __.stopSelectionUpdates()__: stop the toolbar from updating to reflect the state of the selected text
* __.startSelectionUpdates()__: put the toolbar back into its normal updating state
* __.cleanPaste(text)__: convert text to plaintext and replace current selection with result
* __.pasteHTML(html, options)__: replace the current selection with html

### Helper Methods
* __.on(target, event, listener, useCapture)__: attach a listener to a DOM event which will be detached when MediumEditor is deactivated
* __.off(target, event, listener, useCapture)__: detach a listener to a DOM event that was attached via `on()`
* __.delay(fn)__: delay any function from being executed by the amount of time passed as the `delay` option
* __.getSelectionParentElement(range)__: get the parent contenteditable element that contains the current selection
* __.getExtensionByName(name)__: get a reference to an extension with the specified name
* __.getFocusedElement()__: returns an element if any contenteditable element monitored by MediumEditor currently has focused
* __.selectElement(element)__: change selection to be a specific element and update the toolbar to reflect the selection
* __.exportSelection()__: return a data representation of the selected text, which can be applied via `importSelection()`
* __.importSelection(selectionState)__: restore the selection using a data representation of previously selected text (ie value returned by `exportSelection()`)

## Capturing DOM changes

For observing any changes on contentEditable, use the custom 'editableInput' event exposed via the `subscribe()` method:

```js
var editor = new MediumEditor('.editable');
editor.subscribe('editableInput', function (event, editable) {
    // Do some work
});
```

This event is supported in all browsers supported by MediumEditor (including IE9+)!  To help with cases when one instance of MediumEditor is monitoring multiple elements, the 2nd argument passed to the event handler (`editable` in the example above) will be a reference to the contenteditable element that has actually changed.

This is handy when you need to capture any modifications to the contenteditable element including:
* Typing
* Cutting/Pasting
* Changes from clicking on buttons in the toolbar
* Undo/Redo

Why is this interesting and why should you use this event instead of just attaching to the `input` event on the contenteditable element?

So for most modern browsers (Chrome, Firefox, Safari, etc.), the `input` event works just fine. Infact, `editableInput` is just a proxy for the `input` event in those browsers. However, the `input` event [is not supported for contenteditable elements in IE 9-11](https://connect.microsoft.com/IE/feedback/details/794285/ie10-11-input-event-does-not-fire-on-div-with-contenteditable-set).

So, to properly support the `editableInput` event in Internet Explorer, MediumEditor uses a combination of the `selectionchange` and `keypress` events, as well as monitoring calls to `document.execCommand`.

## Extensions & Plugins

Check the [documentation](https://github.com/daviferreira/medium-editor/wiki/Custom-Buttons-and-Extensions) in order to learn how to develop extensions for MediumEditor.

A list of existing extensions and plugins, such as [Images and Media embeds](http://orthes.github.io/medium-editor-insert-plugin/), [Tables](https://github.com/daviferreira/medium-editor-tables) and [Markdown](https://github.com/IonicaBizau/medium-editor-markdown) can be found [here](https://github.com/daviferreira/medium-editor/wiki/Extensions-Plugins).

## Development

MediumEditor development tasks are managed by Grunt. To install all the necessary packages, just invoke:

```bash
npm install
```

To run all the test and build the dist files for testing on demo pages, just invoke:
```bash
grunt
```

These are the other available grunt tasks:

* __js__: runs jslint and jasmine tests and creates minified and concatenated versions of the script;
* __css__: runs autoprefixer and csslint
* __test__: runs jasmine tests, jslint and csslint
* __watch__: watch for modifications on script/scss files
* __spec__: runs a task against a specified file

The source files are located inside the __src__ directory.  Be sure to make changes to these files and not files in the dist directory.

## Contributing

[Kill some bugs :)](https://github.com/daviferreira/medium-editor/issues?q=is%3Aopen+is%3Aissue+label%3Abug)

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Test your changes to the best of your ability.
4. Update the documentation to reflect your changes if they add or changes current functionality.
5. Commit your changes (`git commit -am 'Added some feature'`)
6. Push to the branch (`git push origin my-new-feature`)
7. Create new Pull Request

### Code Consistency

To help create consistent looking code throughout the project, we use a few tools to help us. They have plugins for most popular editors/IDEs to make coding for our project, but you should use them in your project as well!

#### JSHint

We use [JSHint](http://jshint.com/) on each build to find easy-to-catch errors and potential problems in our js.  You can find our JSHint settings in the `.jshintrc` file in the root of the project.

#### jscs

We use [jscs](http://jscs.info/) on each build to enforce some code style rules we have for our project.  You can find our jscs settings in the `.jscsrc` file in the root of the project.

#### EditorConfig

We use [EditorConfig](http://EditorConfig.org) to maintain consistent coding styles between various editors and IDEs.  You can find our settings in the `.editorconfig` file in the root of the project.

### Easy First Bugs

Looking for something simple for a first contribution? Try fixing an [easy first bug](https://github.com/daviferreira/medium-editor/issues?q=is%3Aopen+is%3Aissue+label%3A%22easy+first+bug%22)!

## Contributors (100+ and counting!)

[https://github.com/daviferreira/medium-editor/graphs/contributors](https://github.com/daviferreira/medium-editor/graphs/contributors)

## License

MIT: https://github.com/daviferreira/medium-editor/blob/master/LICENSE
