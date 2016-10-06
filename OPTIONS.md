# MediumEditor Options (v5.0.0)

Options to customize medium-editor are passed as the second argument to the [MediumEditor constructor](API.md#mediumeditorelements-options).  Example:

```js
var editor = new MediumEditor('.editor', {
    // options go here
});
```

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Core Options](#core-options)
    - [`activeButtonClass`](#activebuttonclass)
    - [`buttonLabels`](#buttonlabels)
    - [`contentWindow`](#contentwindow)
    - [`delay`](#delay)
    - [`disableReturn`](#disablereturn)
    - [`disableDoubleReturn`](#disabledoublereturn)
    - [`disableExtraSpaces`](#disableextraspaces)
    - [`disableEditing`](#disableediting)
    - [`elementsContainer`](#elementscontainer)
    - [`extensions`](#extensions)
    - [`ownerDocument`](#ownerdocument)
    - [`spellcheck`](#spellcheck)
    - [`targetBlank`](#targetblank)
- [Toolbar options](#toolbar-options)
    - [`allowMultiParagraphSelection`](#allowmultiparagraphselection)
    - [`buttons`](#buttons)
    - [`diffLeft`](#diffleft)
    - [`diffTop`](#difftop)
    - [`firstButtonClass`](#firstbuttonclass)
    - [`lastButtonClass`](#lastbuttonclass)
    - [`relativeContainer`](#relativecontainer)
    - [`standardizeSelectionStart`](#standardizeselectionstart)
    - [`static`](#static)
  - ['static' Toolbar Options](#static-toolbar-options)
    - [`align`](#align)
    - [`sticky`](#sticky)
    - [`stickyTopOffset`](#stickytopoffset)
    - [`updateOnEmptySelection`](#updateonemptyselection)
  - [Disabling Toolbar](#disabling-toolbar)
- [Anchor Preview options](#anchor-preview-options)
    - [`hideDelay`](#hidedelay)
    - [`previewValueSelector`](#previewvalueselector)
    - [`showOnEmptyLinks`](#showonemptylinks)
    - [`showWhenToolbarIsVisible`](#showwhentoolbarisvisible)
  - [Disabling Anchor Preview](#disabling-anchor-preview)
- [Placeholder Options](#placeholder-options)
    - [`text`](#text)
    - [`hideOnClick`](#hideonclick)
  - [Disabling Placeholders](#disabling-placeholders)
- [Anchor Form options](#anchor-form-options)
    - [`customClassOption`](#customclassoption)
    - [`customClassOptionText`](#customclassoptiontext)
    - [`linkValidation`](#linkvalidation)
    - [`placeholderText`](#placeholdertext)
    - [`targetCheckbox`](#targetcheckbox)
    - [`targetCheckboxText`](#targetcheckboxtext)
- [Paste Options](#paste-options)
    - [`forcePlainText`](#forceplaintext)
    - [`cleanPastedHTML`](#cleanpastedhtml)
    - [`cleanReplacements`](#cleanreplacements)
    - [`cleanAttrs`](#cleanattrs)
    - [`cleanTags`](#cleantags)
    - [`unwrapTags`](#unwraptags)
  - [Disabling Paste Handling](#disabling-paste-handling)
- [KeyboardCommands Options](#keyboardcommands-options)
    - [`commands`](#commands)
  - [Disabling Keyboard Commands](#disabling-keyboard-commands)
- [Auto Link Options](#auto-link-options)
    - [`autoLink`](#autolink)
  - [Enabling Auto Link](#enabling-auto-link)
- [Image Dragging Options](#image-dragging-options)
    - [`imageDragging`](#imagedragging)
  - [Disabling Image Dragging](#disabling-image-dragging)
- [Options Example:](#options-example)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Core Options

These are global options that apply to the entire editor. Example:

```js
var editor = new MediumEditor('.editable', {
    /* These are the default options for the editor,
        if nothing is passed this is what is used */
    activeButtonClass: 'medium-editor-button-active',
    allowMultiParagraphSelection: true,
    buttonLabels: false,
    contentWindow: window,
    delay: 0,
    disableReturn: false,
    disableDoubleReturn: false,
    disableExtraSpaces: false,
    disableEditing: false,
    elementsContainer: false,
    extensions: {},
    ownerDocument: document,
    spellcheck: true,
    targetBlank: false
});
```

#### `activeButtonClass`
**Default:** `'medium-editor-button-active'`

CSS class added to active buttons in the toolbar.

***
#### `buttonLabels`
**Default:** `false`

Custom content for the toolbar buttons.

**Valid Values:**
* `false`
  * Use default button labels
* `'fontawesome'`
  * Uses fontawesome icon set for all toolbar icons

**NOTE**:

Using `'fontawesome'` as the buttonLabels requires version 4.1.0 of the fontawesome css to be on the page to ensure all icons will be displayed correctly.

***
#### `contentWindow`
**Default:** `window`

The contentWindow object that contains the contenteditable element. MediumEditor will use this for attaching events, getting selection, etc.

***
#### `delay`
**Default:** `0`

Time in milliseconds to show the toolbar or anchor tag preview.

***
#### `disableReturn`
**Default:** `false`

Enables/disables the use of the return-key. You can also set specific element behavior by using setting a data-disable-return attribute.

***
#### `disableDoubleReturn`
**Default:** `false`

Allows/disallows two (or more) empty new lines. You can also set specific element behavior by using setting a data-disable-double-return attribute.

***
#### `disableExtraSpaces`
**Default:** `false`

When set to true, it disallows spaces at the beginning and end of the element. Also it disallows entering 2 consecutive spaces between 2 words.

***
#### `disableEditing`
**Default:** `false`

Enables/disables adding the contenteditable behavior. Useful for using the toolbar with customized buttons/actions. You can also set specific element behavior by using setting a data-disable-editing attribute.

***
#### `elementsContainer`
**Default:** `ownerDocument.body`

Specifies a DOM node to contain MediumEditor's toolbar and anchor preview elements.

***
#### `extensions`
**Default:** `{}`

Custom extensions to use. See [Custom Buttons and Extensions](src/js/extensions) for more details on extensions.

***
#### `ownerDocument`
**Default:** `window.document`

The ownerDocument object for the contenteditable element.  MediumEditor will use this for creating elements, getting selection, attaching events, etc.

***
#### `spellcheck`
**Default:** `true`

Enable/disable native contentEditable automatic spellcheck.

***
#### `targetBlank`
**Default:** `false`

Enables/disables automatically adding the `target="_blank"` attribute to anchor tags.

## Toolbar options

The toolbar for MediumEditor is implemented as a built-in extension which automatically displays whenever the user selects some text.  The toolbar can hold any set of defined built-in buttons, but can also hold any custom buttons passed in as extensions.

Options for the toolbar are passed as an object that is a member of the outer options object. Example:
```js
var editor = new MediumEditor('.editable', {
    toolbar: {
        /* These are the default options for the toolbar,
           if nothing is passed this is what is used */
        allowMultiParagraphSelection: true,
        buttons: ['bold', 'italic', 'underline', 'anchor', 'h2', 'h3', 'quote'],
        diffLeft: 0,
        diffTop: -10,
        firstButtonClass: 'medium-editor-button-first',
        lastButtonClass: 'medium-editor-button-last',
        relativeContainer: null,
        standardizeSelectionStart: false,
        static: false,

        /* options which only apply when static is true */
        align: 'center',
        sticky: false,
        updateOnEmptySelection: false
    }
});
```

***
#### `allowMultiParagraphSelection`
**Default:** `true`

enables/disables whether the toolbar should be displayed when selecting multiple paragraphs/block elements.

***
#### `buttons`
**Default:** `['bold', 'italic', 'underline', 'anchor', 'h2', 'h3', 'quote']`

The set of buttons to display on the toolbar.

***
#### `diffLeft`
**Default:** `0`

Value in pixels to be added to the X axis positioning of the toolbar.

***
#### `diffTop`
**Default:** `-10`

Value in pixels to be added to the Y axis positioning of the toolbar.

***
#### `firstButtonClass`
**Default:** `'medium-editor-button-first'`

CSS class added to the first button in the toolbar.

***
#### `lastButtonClass`
**Default:** `'medium-editor-button-last'`

CSS class added to the last button in the toolbar.

***
#### `relativeContainer`
**Default:** `null`

DOMElement to append the toolbar to instead of the body.  When an element is passed the toolbar will also be positioned `relative` instead of `absolute`, which means the editor will not attempt to manually position the toolbar automatically.

**NOTE:**
* Using this in combination with the `static` option for toolbar is not explicitly supported and the behavior in this case is not defined.

***
#### `standardizeSelectionStart`
**Default:** `false`

Enables/disables standardizing how the beginning of a range is decided between browsers whenever the selected text is analyzed for updating toolbar buttons status.

***
#### `static`
**Default:** `false`

Enable/disable the toolbar always displaying in the same location relative to the medium-editor element.


### 'static' Toolbar Options

These options only apply when the `static` option is being used.

***
#### `align`
**Default:** `center`

When the __static__ option is `true`, this aligns the static toolbar relative to the medium-editor element.

**Valid Values**

`'left'` | `'center'` | `'right'`

***
#### `sticky`
**Default:** `false`

When the __static__ option is `true`, this enables/disables the toolbar "sticking" to the viewport and staying visible on the screen while the page scrolls.

***
#### `stickyTopOffset`
**Default:** `0`

When the __sticky__ option is `true`, this set in pixel a top offset above the toolbar.

***
#### `updateOnEmptySelection`
**Default:** `false`

When the __static__ option is `true`, this enables/disables updating the state of the toolbar buttons even when the selection is collapsed (there is no selection, just a cursor).

### Disabling Toolbar

To disable the toolbar (which also disables the anchor-preview extension), set the value of the `toolbar` option to `false`:
```javascript
var editor = new MediumEditor('.editable', {
    toolbar: false
});
```


## Anchor Preview options

The anchor preview is a built-in extension which automatically displays a 'tooltip' when the user is hovering over a link in the editor.  The tooltip will display the `href` of the link, and when click, will open the anchor editing form in the toolbar.

Options for the anchor preview 'tooltip' are passed as an object that is a member of the outer options object. Example:
```javascript
var editor = new MediumEditor('.editable', {
    anchorPreview: {
        /* These are the default options for anchor preview,
           if nothing is passed this is what it used */
        hideDelay: 500,
        previewValueSelector: 'a'
    }
}
});
```


***
#### `hideDelay`
**Default:** `500`

Time in milliseconds to show the anchor tag preview after the mouse has left the anchor tag.

***
#### `previewValueSelector`
**Default:** `'a'`

The default selector to locate where to put the activeAnchor value in the preview. You should only need to override this if you've modified the way in which the anchor-preview extension renders.

***
#### `showOnEmptyLinks`
**Default:** `true`

Determines whether the anchor tag preview shows up on link with href as "" or "#something". You should set this value to false if you do not want the preview to show up in such use cases.

***
#### `showWhenToolbarIsVisible`
**Default:** `false`

Determines whether the anchor tag preview shows up when the toolbar is visible. You should set this value to true if the static option for the toolbar is true and you want the preview to show at the same time.

### Disabling Anchor Preview

To disable the anchor preview, set the value of the `anchorPreview` option to `false`:
```javascript
var editor = new MediumEditor('.editable', {
    anchorPreview: false
});
```

**NOTE:**

* If the toolbar is disabled (via `toolbar: false` option or `data-disable-toolbar` attribute) the anchor-preview is automatically disabled.
* If the anchor editing form is not enabled, clicking on the anchor-preview will not allow the href of the link to be edited

## Placeholder Options

The placeholder handler is a built-in extension which displays placeholder text when the editor is empty.

Options for placeholder are passed as an object that is a member of the outer options object. Example:
```javascript
var editor = new MediumEditor('.editable', {
    placeholder: {
        /* This example includes the default options for placeholder,
           if nothing is passed this is what it used */
        text: 'Type your text',
        hideOnClick: true
    }
});
```


***
#### `text`
**Default:** `'Type your text'`

Defines the default placeholder for empty contenteditables when __placeholder__ is not set to false. You can overwrite it by setting a `data-placeholder` attribute on the editor elements.

***
#### `hideOnClick`
**Default:** `true`

Causes the placeholder to disappear as soon as the field gains focus. To hide the placeholder only after starting to type, and to show it again as soon as field is empty, set this option to `false`.


### Disabling Placeholders

To disable the placeholder, set the value of the `placeholder` option to `false`:
```javascript
var editor = new MediumEditor('.editable', {
    placeholder: false
});
```

## Anchor Form options

The anchor form is a built-in button extension which allows the user to add/edit/remove links from within the editor.  When 'anchor' is passed in as a button in the list of buttons, this extension will be enabled and can be triggered by clicking the corresponding button in the toolbar.

Options for the anchor form are passed as an object that is a member of the outer options object. Example:
```javascript
var editor = new MediumEditor('.editable', {
    toolbar: {
        buttons: ['bold', 'italic', 'underline', 'anchor']
    },
    anchor: {
        /* These are the default options for anchor form,
           if nothing is passed this is what it used */
        customClassOption: null,
        customClassOptionText: 'Button',
        linkValidation: false,
        placeholderText: 'Paste or type a link',
        targetCheckbox: false,
        targetCheckboxText: 'Open in new window'
    }
}
});
```


***
#### `customClassOption`
**Default:** `null`

Custom class name the user can optionally have added to their created links (ie 'button').  If passed as a non-empty string, a checkbox will be displayed allowing the user to choose whether to have the class added to the created link or not.

***
#### `customClassOptionText`
**Default:** `'Button'`

Text to be shown in the checkbox when the __customClassOption__ is being used.

***
#### `linkValidation`
**Default:** `false`

Enables/disables check for common URL protocols on anchor links. Converts invalid url characters (ie spaces) to valid characters using `encodeURI`

***
#### `placeholderText`
**Default:** `'Paste or type a link'`

Text to be shown as placeholder of the anchor input.

***
#### `targetCheckbox`
**Default:** `false`

Enables/disables displaying a "Open in new window" checkbox, which when checked changes the `target` attribute of the created link.

***
#### `targetCheckboxText`
**Default:** `'Open in new window'`

Text to be shown in the checkbox enabled via the __targetCheckbox__ option.

## Paste Options

The paste handler is a built-in extension which attempts to filter the content when the user pastes.  How the paste handler filters is configurable via specific options.

Options for paste handling are passed as an object that is a member of the outer options object. Example:
```javascript
var editor = new MediumEditor('.editable', {
    paste: {
        /* This example includes the default options for paste,
           if nothing is passed this is what it used */
        forcePlainText: true,
        cleanPastedHTML: false,
        cleanReplacements: [],
        cleanAttrs: ['class', 'style', 'dir'],
        cleanTags: ['meta']
    }
});
```


***
#### `forcePlainText`
**Default:** `true`

Forces pasting as plain text.

***
#### `cleanPastedHTML`
**Default:** `false`

Cleans pasted content from different sources, like google docs etc.

***
#### `cleanReplacements`
**Default:** `[]`

Custom pairs (2 element arrays) of RegExp and replacement text to use during paste when __forcePlainText__ or __cleanPastedHTML__ are `true` OR when calling `cleanPaste(text)` helper method.

***
#### `cleanAttrs`
**Default:** `['class', 'style', 'dir']`

List of element attributes to remove during paste when __cleanPastedHTML__ is `true` or when calling `cleanPaste(text)` or `pasteHTML(html,options)` helper methods.

***
#### `cleanTags`
**Default:** `['meta']`

List of element tag names to remove during paste when __cleanPastedHTML__ is `true` or when calling `cleanPaste(text)` or `pasteHTML(html,options)` helper methods.

***
#### `unwrapTags`
**Default:** `[]`

List of element tag names to unwrap (remove the element tag but retain its child elements) during paste when __cleanPastedHTML__ is `true` or when calling `cleanPaste(text)` or `pasteHTML(html,options)` helper methods.

***
### Disabling Paste Handling

To disable MediumEditor manipulating pasted content, set the both the `forcePlainText` and `cleanPastedHTML` options to `false`:
```javascript
var editor = new MediumEditor('.editable', {
    paste: {
        forcePlainText: false,
        cleanPastedHTML: false
    }
});
```

## KeyboardCommands Options

The keyboard commands handler is a built-in extension for mapping key-combinations to actions to execute in the editor.

Options for KeyboardCommands are passed as an object that is a member of the outer options object. Example:
```javascript
var editor = new MediumEditor('.editable', {
    keyboardCommands: {
        /* This example includes the default options for keyboardCommands,
           if nothing is passed this is what it used */
        commands: [
            {
                command: 'bold',
                key: 'b',
                meta: true,
                shift: false
            },
            {
                command: 'italic',
                key: 'i',
                meta: true,
                shift: false
            },
            {
                command: 'underline',
                key: 'u',
                meta: true,
                shift: false
            }
        ],
    }
});
```


***
#### `commands`
**Default:** shortcuts for `bold`, `italic`, and `underline` (See above example)

Array of objects describing each command and the combination of keys that will trigger it.  Required for each object:
  * _command_: argument passed to `editor.execAction()` when key-combination is used
  * _key_: keyboard character that triggers this command
  * _meta_: whether the ctrl/meta key has to be active or inactive
  * _shift_: whether the shift key has to be active or inactive

### Disabling Keyboard Commands

To disable the keyboard commands, set the value of the `keyboardCommands` option to `false`:
```javascript
var editor = new MediumEditor('.editable', {
    keyboardCommands: false
});
```

## Auto Link Options

#### `autoLink`
**Default:** `false`

The auto-link handler is a built-in extension which automatically turns URLs entered into the text field into HTML anchor tags (similar to the functionality of Markdown).  This feature is OFF by default.

### Enabling Auto Link

To enable built-in auto-link support, set the value of the `autoLink` option to `true`:

```javascript
var editor = new MediumEditor('.editable', {
    autoLink: true
});
```

## Image Dragging Options

#### `imageDragging`
**Default:** `true`

The image dragging handler is a built-in extension for handling dragging & dropping images into the contenteditable.  This feature is ON by default.

### Disabling Image Dragging

To disable built-in image dragging, set the value of the `imageDragging` option to `false`:
```javascript
var editor = new MediumEditor('.editable', {
    imageDragging: false
});
```

## Options Example:

```javascript
var editor = new MediumEditor('.editable', {
    delay: 1000,
    targetBlank: true,
    toolbar: {
        buttons: ['bold', 'italic', 'quote'],
        diffLeft: 25,
        diffTop: 10,
    },
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
