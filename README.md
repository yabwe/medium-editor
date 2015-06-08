# MediumEditor

[![Join the chat at https://gitter.im/yabwe/medium-editor](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/yabwe/medium-editor?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

This is a clone of [medium.com](https://medium.com) inline editor toolbar.

MediumEditor has been written using vanilla JavaScript, no additional frameworks required.

## Browser Support

[![Sauce Test Status](https://saucelabs.com/browser-matrix/mediumeditor.svg)](https://saucelabs.com/u/mediumeditor)

![Supportd Browsers](https://cloud.githubusercontent.com/assets/2444240/7519189/a819e426-f4ad-11e4-8740-626396c5d61b.png)

[![NPM info](https://nodei.co/npm/medium-editor.png?downloads=true)](https://www.npmjs.com/package/medium-editor)

[![Travis build status](http://img.shields.io/travis/yabwe/medium-editor/master.svg?style=flat-square)](https://travis-ci.org/yabwe/medium-editor)
[![dependencies](http://img.shields.io/david/yabwe/medium-editor.svg?style=flat-square)](https://david-dm.org/yabwe/medium-editor)
[![devDependency Status](http://img.shields.io/david/dev/yabwe/medium-editor.svg?style=flat-square)](https://david-dm.org/yabwe/medium-editor#info=devDependencies)
[![Coverage Status](http://img.shields.io/coveralls/yabwe/medium-editor.svg?style=flat-square)](https://coveralls.io/r/yabwe/medium-editor?branch=master)

# Basic usage

![screenshot](https://raw.github.com/yabwe/medium-editor/master/demo/img/medium-editor.jpg)

__demo__: [http://yabwe.github.io/medium-editor/](http://yabwe.github.io/medium-editor/)

### Installation

**Via npm:**

Run in your console: `npm install medium-editor`

**Via bower:**

`bower install medium-editor`

**Via an external CDN**

* Using [jsDelivr](http://www.jsdelivr.com/#!medium-editor).

 For the latest version:

 ```html
 <script src="//cdn.jsdelivr.net/medium-editor/latest/js/medium-editor.min.js"></script>
 <link rel="stylesheet" href="//cdn.jsdelivr.net/medium-editor/latest/css/medium-editor.min.css" type="text/css" media="screen" charset="utf-8">
 ```

 For a custom one:

 ```html
 <script src="//cdn.jsdelivr.net/medium-editor/4.11.1/js/medium-editor.min.js"></script>
 <link rel="stylesheet" href="//cdn.jsdelivr.net/medium-editor/4.11.1/css/medium-editor.min.css" type="text/css" media="screen" charset="utf-8">
 ```

* Using [CDNJS](https://cdnjs.com/libraries/medium-editor).

**Manual installation:**

Download the [latest release](https://github.com/yabwe/medium-editor/releases) and attach medium editor's stylesheets to your page:

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

##### Integrating with various frameworks

People have contributed wrappers around MediumEditor for integrating with different frameworks and tech stacks.  Take a look at the list of existing [Wrappers and Integrations](https://github.com/yabwe/medium-editor/wiki/Wrappers-and-Integration) that have already been written for MediumEditor!

## MediumEditor Options

View the [MediumEditor Options documentation](https://github.com/yabwe/medium-editor/wiki/Options) on the Wiki for details on all the various options for MediumEditor.

Options are passed to MediumEditor during initialization via an object passed as the 2nd argument to the MediumEditor constructor.

### Example:

```javascript
var editor = new MediumEditor('.editable', {
    buttons: ['bold', 'italic', 'quote'],
    diffLeft: 25,
    diffTop: 10,
    firstHeader: 'h1',
    secondHeader: 'h2',
    delay: 1000,
    targetBlank: true,
    anchor: {
        placeholderText: 'Type a link',
        customClassOption: 'btn',
        customClassOptionText: 'Create Button'
    },
    paste: {
        cleanPastedHTML: true,
        cleanAttrs: ['style', 'dir'],
        cleanTags: ['label', 'meta']
    },
    anchorPreview: {
        hideDelay: 300
    },
    placeholder: {
        text: 'Click to edit'
    }
});
```

## Buttons

By default, MediumEditor supports buttons for most of the commands for `document.execCommand()` that are well-supported across all its supported browsers.

### Default buttons.

MediumEditor, by default, will show only the buttons listed here to avoid a huge toolbar:

* __bold__
* __italic__
* __underline__
* __anchor__ _(built-in support for collecting a url via the anchor extension)_
* __header1__
* __header2__
* __quote__

### All buttons.

These are all the built-in buttons supported by MediumEditor.

* __bold__
* __italic__
* __underline__
* __strikethrough__
* __subscript__
* __superscript__
* __image__ (this simply converts selected text to an image tag)
* __quote__
* __pre__
* __orderedlist__
* __unorderedlist__
* __indent__ (moves the selected text up one level)
* __outdent__ (moves the selected text down one level)
* __justifyLeft__
* __justifyCenter__
* __justifyRight__
* __justifyFull__
* __header1__
* __header2__
* __removeFormat__ (clears inline style formatting, preserves blocks)

## Themes

Check out the Wiki page for a list of available themes: [https://github.com/yabwe/medium-editor/wiki/Themes](https://github.com/yabwe/medium-editor/wiki/Themes)

## API

View the [MediumEditor Object API documentation](https://github.com/yabwe/medium-editor/wiki/MediumEditor-Object-API) on the Wiki for details on all the methods supported on the MediumEditor object.

## Capturing DOM changes

For observing any changes on contentEditable, use the custom `'editableInput'` event exposed via the `subscribe()` method:

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

Check the [documentation](https://github.com/yabwe/medium-editor/wiki/Custom-Buttons-and-Extensions) in order to learn how to develop extensions for MediumEditor.

A list of existing extensions and plugins, such as [Images and Media embeds](http://orthes.github.io/medium-editor-insert-plugin/), [Tables](https://github.com/yabwe/medium-editor-tables) and [Markdown](https://github.com/IonicaBizau/medium-editor-markdown) can be found [here](https://github.com/yabwe/medium-editor/wiki/Extensions-Plugins).

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

[Kill some bugs :)](https://github.com/yabwe/medium-editor/issues?q=is%3Aopen+is%3Aissue+label%3Abug)

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Test your changes to the best of your ability.
4. Update the documentation to reflect your changes if they add or changes current functionality.
5. Commit your changes (`git commit -am 'Added some feature'`) **without files from the _dist_ directory**.
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

Looking for something simple for a first contribution? Try fixing an [easy first bug](https://github.com/yabwe/medium-editor/issues?q=is%3Aopen+is%3Aissue+label%3A%22easy+first+bug%22)!

## Contributors (100+ and counting!)

[https://github.com/yabwe/medium-editor/graphs/contributors](https://github.com/yabwe/medium-editor/graphs/contributors)

## License

MIT: https://github.com/yabwe/medium-editor/blob/master/LICENSE
