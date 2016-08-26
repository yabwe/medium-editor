# Extensions

* [Building An Extension (Walkthrough)](./WALKTHROUGH-EXTENSION.md)
* [Building A Button (Walkthrough)](./WALKTHROUGH-BUTTON.md)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

* [What is an Extension?](#what-is-an-extension)
  * [Examples of functionality that are implemented via built-in extensions:](#examples-of-functionality-that-are-implemented-via-built-in-extensions)
  * [Examples of custom built external extensions:](#examples-of-custom-built-external-extensions)
* [What is a Button?](#what-is-a-button)
  * [All of the built-in MediumEditor buttons are just Button Extensions with different configuration](#all-of-the-built-in-mediumeditor-buttons-are-just-button-extensions-with-different-configuration)
  * [Examples of custom built external buttons:](#examples-of-custom-built-external-buttons)
* [What is a Form Extension?](#what-is-a-form-extension)
  * [Built-in Form Extensions](#built-in-form-extensions)
* [Extension](#extension)
  * [Extension Interface](#extension-interface)
    * [`name` _(string)_](#name-_string_)
    * [`init()`](#init)
    * [`checkState(node)`](#checkstatenode)
    * [`destroy()`](#destroy)
    * [`queryCommandState()`](#querycommandstate)
    * [`getInteractionElements()`](#getinteractionelements)
    * [`isActive()`](#isactive)
    * [`isAlreadyApplied(node)`](#isalreadyappliednode)
    * [`setActive()`](#setactive)
    * [`setInactive()`](#setinactive)
  * [Extension Helpers](#extension-helpers)
    * [`base` _(MediumEditor)_](#base-_mediumeditor_)
    * [`window` _(Window)_](#window-_window_)
    * [`document` _(Document)_](#document-_document_)
    * [`getEditorElements()`](#geteditorelements)
    * [`getEditorId()`](#geteditorid)
    * [`getEditorOption(option)`](#geteditoroptionoption)
  * [Extension Proxy Methods](#extension-proxy-methods)
    * [`execAction(action, opts)`](#execactionaction-opts)
    * [`on(target, event, listener, useCapture)`](#ontarget-event-listener-usecapture)
    * [`off(target, event, listener, useCapture)`](#offtarget-event-listener-usecapture)
    * [`subscribe(name, listener)`](#subscribename-listener)
    * [`trigger(name, data, editable)`](#triggername-data-editable)
* [Button](#button)
  * [Button Interface](#button-interface)
    * [`getButton()`](#getbutton)
  * [Button Helpers](#button-helpers)
    * [`action` _(string)_](#action-_string_)
    * [`aria` _(string)_](#aria-_string_)
    * [`tagNames` _(Array)_](#tagnames-_array_)
    * [`style` _(Object)_](#style-_object_)
    * [`useQueryState` _(boolean)_](#usequerystate-_boolean_)
    * [`contentDefault` _(string)_](#contentdefault-_string_)
    * [`contentFA` _(string)_](#contentfa-_string_)
    * [`classList` _(Array)_](#classlist-_array_)
    * [`attrs` _(Object)_](#attrs-_object_)
    * [`handleClick(event)` _(function)_](#handleclickevent-_function_)
* [Form Button](#form-button)
  * [Form Button Interface](#form-button-interface)
  * [Form Button Helpers](#form-button-helpers)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## What is an Extension?

**Extensions** are custom actions or commands that can be passed in via the `extensions` option to medium-editor.  They can replace existing buttons if they share the same name, or can add additional custom functionality into the editor.  Extensions can be implemented in any way, and just provide a way to hook into medium-editor.  New extensions can be created by extending the exposed `MediumEditor.Extension` object via `MediumEditor.Extension.extend()`.


#### Examples of functionality that are implemented via built-in extensions:
* [The MediumEditor Toolbar](https://github.com/yabwe/medium-editor/blob/toolbar-extension/src/js/extensions/toolbar.js)
  * The entire toolbar which contains all of the MediumEditor buttons is implemented as an extension!
* [Auto-Link Detection](https://github.com/yabwe/medium-editor/blob/master/src/js/extensions/auto-link.js)
  * Automatically detecting when a url has been added and converting it into an anchor tag
* [Anchor Preview Tooltip](https://github.com/yabwe/medium-editor/blob/master/src/js/extensions/anchor-preview.js)
  * When a user hovers over a link a tooltip is displayed showing the href of the anchor tag
* [Image Drag & Drop](https://github.com/yabwe/medium-editor/blob/master/src/js/extensions/image-dragging.js)
  * Allows users to drag and drop images into the editor
* [Keyboard Commands](https://github.com/yabwe/medium-editor/blob/master/src/js/extensions/keyboard-commands.js)
  * Mapping keyboard shortcuts to various commands
* [Placeholder Text](https://github.com/yabwe/medium-editor/blob/master/src/js/extensions/placeholder.js)
  * Shows placeholder text when the editor is empty
* [Paste Handling](https://github.com/yabwe/medium-editor/blob/master/src/js/extensions/paste.js)
  * Handles filtering and modifying text that is pasted into the editor

#### Examples of custom built external extensions:
* [MediumEditor markdown](https://github.com/IonicaBizau/medium-editor-markdown)
  * A Medium Editor extension to add markdown support.
* [MediumEditor Insert Plugin](https://github.com/orthes/medium-editor-insert-plugin)
  * Enables users to insert into the editor various types of content like images or embeds.
* [MediumEditor Multi-placeholder Plugin](https://github.com/smiled0g/medium-editor-multi-placeholders-plugin)
  * Enables users to add multiple placeholders with specific HTML tags.
* [MediumEditor TCMention Plugin](https://github.com/tomchentw/medium-editor-tc-mention)
  * A Medium Editor extension for adding custom 'mention' support, circa Medium 2.0.
* [MediumEditor AutoList](https://github.com/varun-raj/medium-editor-autolist)
  * A Medium Editor extension for converting `1.` and `*` into ordered lists and unordered lists.
* [MediumEditor Toolbar States](https://github.com/davideanderson/medium-editor-toolbar-states)
  * An Extension for the medium-editor which allows different toolbar configurations based on the selected element(s).
* [MediumEditor AutoFocus](https://github.com/dazorni/medium-editor-autofocus)
  * Autofocus plugin for medium-editor
* [MediumEditor Thaana Keyboard](https://github.com/jawish/medium-editor-thaanakbd)
  * Thaana Keyboard extension for medium-editor
* [MediumEditor Merge Fields Plugin](https://github.com/epascarello/merge-fields-plugin-for-medium-editor)
  * Add merge fields for medium-editor
* [MediumEditor Google Docs Anchor Preview](https://github.com/patternhq/MediumTools/tree/master/GdocMediumAnchorPreview)
  * Google Doc style link preview for medium-editor

## What is a Button?
**Buttons** are a specific type of Extension which have a contract with the MediumEditor toolbar.  Buttons have specific lifecycle methods that MediumEditor and the toolbar use to interact with these specific types of Extensions.  These contract create easy hooks, allowing custom buttons to:
* Display an element in the toolbar _(ie a clickable button/link)_
* Execute an action on the editor text when clicked _(ie bold, underline, blockquote, etc.)_
* Update the appearance of the element based on the user selection _(ie the bold button looks 'active' if the selected text is already bold, 'inactive' if the text is not bold)_

#### All of the built-in MediumEditor buttons are just Button Extensions with different [configuration](https://github.com/yabwe/medium-editor/blob/master/src/js/defaults/buttons.js):
* bold, italic, underline, strikethrough
* subscript, superscript
* image
* quote, pre
* orderedlist, unorderedlist
* indent, outdent
* justifyLeft, justifyCenter, justifyRight, justifyFull
* h1, h2, h3, h4, h5, h6
* removeFormat

#### Examples of custom built external buttons:
* [MediumEditor tables](https://github.com/yabwe/medium-editor-tables)
  * Extension to add a table button/behavior to MediumEditor
* [MediumEditor Custom HTML](https://github.com/jillix/medium-editor-custom-html)
  * An extension that inserts custom HTML using a new button in the MediumEditor toolbar
* [MediumButton](https://github.com/arcs-/MediumButton)
  * Extends your Medium Editor with the possibility add buttons.
* [MediumEditor Phrase](https://github.com/nymag/medium-editor-phrase)
  * Adds a configurable button to the MediumEditor toolbar which adds phrasing content tags (e.g. `span` tags) to selected text.
* [MediumEditor Handsontable](https://github.com/asselinpaul/medium-editor-handsontable)
  * Supports adding [handsontable](https://handsontable.com/) spreadsheets to MediumEditor.
* [MediumEditor Lists](https://github.com/mkawczynski07/medium-editor-list)
  * Adds a "Add Paragraph" button which allows for inserting customized paragraphs to MediumEditor
* [MediumEditor Embed Button](https://github.com/orhanveli/medium-editor-embed-button)
  * oEmbed based embedding button extension to add rich embeds to your document.

## What is a Form Extension?
**Form Extensions** are a specific type of Button Extension which collect input from the user via the toolbar.  Form Extensions extend from Button, and thus inherit all of the lifecycle methods of a Button.  In addition, Form Extensions have some additional methods exposed to interact with MediumEditor and provide some common functionality.

#### Built-in Form Extensions
* [Anchor Button](https://github.com/yabwe/medium-editor/blob/master/src/js/extensions/anchor.js)
  * The `'anchor'` Button is actually a form extension, which when clicked, prompts the the user for a url (as well as some optional checkboxes) via a control in the toolbar and converts the selected text into a link.  If the selection is already a link, clicking the button unwraps text within the anchor tag.
* [FontSize Button (beta)](https://github.com/yabwe/medium-editor/blob/master/src/js/extensions/fontsize.js)
  * The `'fontsize'` Button is a form extension, which when clicked, allows the user to modify the size of the existing text via a control in the toolbar.


# Extension

## Extension Interface

The following are properties and method that MediumEditor will attempt to use / call to interact with the extension internally.

### `name` _(string)_

The name to identify the extension by.  This is used for calls to [`MediumEditor.getExtensionByName(name)`](../../../API.md#getextensionbynamename) to retrieve the extension.  If not defined, this will be set to whatever identifier was used when passing the extension into MediumEditor via the `extensions` option.

```javascript
var MyExtension = MediumEditor.Extension.extend({
  name: 'myextension'
});

var myExt = new MyExtension();

var editor = new MediumEditor('.editor', {
  extensions: {
    'myextension': myExt
  }
});

editor.getExtensionByName(`myextension`) === myExt //true
```

***
### `init()`

Called by MediumEditor during initialization.  The `.base` property will already have been set to current instance of MediumEditor when this is called. All helper methods will exist as well.

***
### `checkState(node)`

If implemented, this method will be called one or more times after the state of the editor & toolbar are updated. When the state is updated, the editor does the following:

1. Find the parent node containing the current selection
2. Call `checkState(node)` on each extension, passing the node as an argument
3. Get the parent node of the previous node
4. Repeat steps #2 and #3 until we move outside the parent contenteditable

**Arguments**

1. _**node** (`Node`)_:

  * Current node, within the ancestors of the selection, that is being checked whenever a selection change occurred.

Here's an example of an extension that will add/remove a class to editor elements depending on whether or the current selection is within an element with a custom data attribute:

```javascript
var EditedExtension = MediumEditor.Extension.extend({
  name: 'edited',
  checkState: function (node) {
    // checkState is called multiple times for each selection change
    // so only store a value if the attribute was found
    if (!this.foundAttribute && node.getAttribute('data-edited')) {
      this.foundAttribute = true;
    }

    // Once we've moved up the ancestors to the container element
    // we know we're done iterating up and can add/remove the css class
    if (MediumEditor.util.isMediumEditorElement(node)) {
      if (this.foundAttribute) {
        node.classList.add('edited-text');
      } else {
        node.classList.remove('edited-text');
      }
      // Make sure the property is not persisted for the next time
      // selection is updated
      delete this.foundAttribute;
    }
  }
});

var editedExt = new EditedExtension();

var editor = new MediumEditor('.editor', {
  extensions: {
    'edited': editedExt
  }
});
```

***
### `destroy()`

If implemented, this method will be called whenever the MediumEditor is being destroyed (via a call to [`MediumEditor.destroy()`](../../../API.md#destroy)).

This gives the extensions the chance to remove any created html, custom event handlers or execute any other cleanup tasks that should be performed.

***
### `queryCommandState()`

If implemented, this method will be called once on each extension when the state of the editor/toolbar is being updated.

If this method returns a non-null value, the extension will be ignored as the code climbs the dom tree.

If this method returns `true`, and the `setActive()` method is defined on the extension, the `setActive()` method will be called by MediumEditor.

**Returns:** `boolean` OR `null`

***
### `getInteractionElements()`

If the extension renders any elements that the user can interact with, this method should be implemented and return the root element or an array containing all of the root elements.

MediumEditor will call this function during interaction to see if the user clicked on something outside of the editor. The elements are used to check if the target element of a click or other user event is a descendant of any extension elements. This way, the editor can also count user interaction within editor elements as interactions with the editor, and thus not trigger 'blur'

***
### `isActive()`

If implemented, this method will be called from MediumEditor to determine whether the button has already been set as 'active'.

If it returns `true`, this extension/button will be skipped for checking its active state as MediumEditor responds to the change in selection.

If it returns `false`, `isAlreadyApplied()` will still be passed each ancestor element as the MediumEditor code climbs the DOM hierarchy to respond to the change in selection.


**Returns:** `boolean`

***
### `isAlreadyApplied(node)`

If implemented, this method is similar to `checkState()` in that it will be called repeatedly as MediumEditor moves up the DOM to update the editor & toolbar after a state change.

**NOTE:**

* This method will NOT be called if `checkState()` has been implemented.
* This method will NOT be called if `queryCommandState()` is implemented and returns a non-null value when called.

**Arguments**

1. _**node** (`Node`)_:

  * Node to check for whether the current extension has already been applied.

**Returns:** `boolean`

***
### `setActive()`

If implemented, this method is called when MediumEditor knows that this extension is currently enabled.

Currently, this method is called when updating the editor & toolbar, and if `queryCommandState()` or `isAlreadyApplied(node)` return true when called.

***
### `setInactive()`

If implemented, this method is called when MediumEditor knows that this extension has not been applied to the current selection. Curently, this is called at the beginning of each state change for the editor & toolbar.

After calling this, MediumEditor will attempt to update the extension, either via `checkState()` or the combination of `queryCommandState()`, `isAlreadyApplied(node)`, `isActive()`, and `setActive()`

## Extension Helpers

The following are helpers that are either set by MediumEditor during initialization, or are helper methods which either route calls to the MediumEditor instance or provide common functionality for all extensions.

### `base` _(MediumEditor)_

A reference to the instance of MediumEditor that this extension is part of.

For example, if you wanted to save the current selection within MediumEditor to be used later, you could call the following within your extension:

```javascript
this.base.saveSelection();
```

***
### `window` _(Window)_

A reference to the content window to be used by this instance of MediumEditor.  This maps to the value of the [`contentWindow`](../../../OPTIONS.md#contentwindow) option that is passed into MediumEditor.

For example, if you wanted to get the width of the window that contains this instance of MediumEditor, you could call the following within your extension:

```javascript
var windowWidth = this.window.innerWidth;
```

***
### `document` _(Document)_

A reference to the owner document to be used by this instance of MediumEditor.  This maps to the value of the [`ownerDocument`](../../../OPTIONS.md#ownerdocument) option that is passed into MediumEditor.

For example, to create an element in the current document corresponding to this instance of MediumEditor, you would call the following within your extension:

```javascript
var button = this.document.createElement('button');
```

***
### `getEditorElements()`

Returns a reference to the array of **elements** monitored by this instance of MediumEditor.

**Returns:** `Array` of `HTMLElement`s

For example, the following is the destroy method of the Placeholder Extension, which removes an attribute from all editor **elements**:

```javascript
MediumEditor.extensions.placeholder = MediumEditor.Extension.extend({
  // ...
  destroy: function () {
    this.getEditorElements().forEach(function (el) {
      if (el.getAttribute('data-placeholder') === this.text) {
        el.removeAttribute('data-placeholder');
      }
    }, this);
  },
  // ...
});
```

***
### `getEditorId()`

Returns the unique identifier for this instance of MediumEditor

**Returns:** `Number`

For example, the following is an excerpt from the `createToolbar()` method of the Toolbar extension, which creates the toolbar element and gives it a unique id tied to the editor's unique id:

```javascript
MediumEditor.extensions.placeholder = MediumEditor.Extension.extend({
  // ...
  createToolbar: function () {
    var toolbar = this.document.createElement('div');

    toolbar.id = 'medium-editor-toolbar-' + this.getEditorId();
    toolbar.className = 'medium-editor-toolbar';

    // ...

    return toolbar;
  },
  // ...
});
```

***
### `getEditorOption(option)`

Returns the value of a specific option used to initialize the MediumEditor object.

**Arguments**

1. _**option** ('String')_

  * Name of the MediumEditor option to retrieve.

**Returns:** Value of the MediumEditor option

For example, the following is an excerpt from the `getTemplate()` method of the Anchor extension, which checks the [`buttonLabels`](../../../OPTIONS.md#buttonlabels) option MediumEditor to decide the appearance of the 'save' button in the form:

```javascript
MediumEditor.extensions.anchor = MediumEditor.extensions.form.extend({
  // ...
  getTemplate: function () {
    var template = [
      '<input type="text" class="medium-editor-toolbar-input" placeholder="', this.placeholderText, '">'
    ];

    template.push(
      '<a href="#" class="medium-editor-toolbar-save">',
      this.getEditorOption('buttonLabels') === 'fontawesome' ? '<i class="fa fa-check"></i>' : this.formSaveLabel,
      '</a>'
    );

    // ...
  },
  // ...
});
```

## Extension Proxy Methods

* These are methods that are just proxied calls into existing MediumEditor functions:

### `execAction(action, opts)`

Calls [`MediumEditor.execAction(action, opts)`](../../../API.md#execactionaction-opts)

For example, the Button Extension will - by default - call `execAction()` each time a button is clicked, to trigger a command:

```javascript
MediumEditor.extensions.button = MediumEditor.Extension.extend({
  // ...
  handleClick: function (event) {
    event.preventDefault();
    event.stopPropagation();

    var action = this.getAction(); // 'bold', 'italic', etc.

    if (action) {
      this.execAction(action);
    }
  },
  // ...
});
```

***
### `on(target, event, listener, useCapture)`

Calls [`MediumEditor.on(target, event, listener, useCapture)`](../../../API.md#ontarget-event-listener-usecapture)

This allows extensions to easily attach event handlers to the DOM which will automatically be detached when MediumEditor is destroyed.

For example, when the Anchor Preview Extension detects a `mouseover` event for a link, it will attach to the `mouseout` event for the same link so it can hide the anchor preview:

```javascript
MediumEditor.extensions.anchorPreview = MediumEditor.Extension.extend({
  // ...
  handleEditableMouseover: function (event) {
    // ...
    this.instanceHandleAnchorMouseout = this.handleAnchorMouseout.bind(this);
    this.on(this.anchorToPreview, 'mouseout', this.instanceHandleAnchorMouseout);
    // ...
  },
  // ...
});
```

***
### `off(target, event, listener, useCapture)`

Calls [`MediumEditor.off(target, event, listener, useCapture)`](../../../API.md#offtarget-event-listener-usecapture)

To compliment the above example for `on(target, event, listener, useCapture)`, when the Anchor Preview Extension detects a `mouseout` event for a link, it will detach the the event handler for `mouseout` until the next time the mouse hovers over the link:

```javascript
MediumEditor.extensions.anchorPreview = MediumEditor.Extension.extend({
  // ...
  handleAnchorMouseout: function () {
    this.anchorToPreview = null;
    this.off(this.activeAnchor, 'mouseout', this.instanceHandleAnchorMouseout);
    this.instanceHandleAnchorMouseout = null;
  },
  // ...
});
```

***
### `subscribe(name, listener)`

Calls [`MediumEditor.subscribe(name, listener)`](../../../API.md#subscribename-listener)

For example, the Keyboard Commands Extension will subscribe to the `editableKeydown` custom event during `init()`, to monitor when keys are pressed while any of the editor **elements** are focused:

```javascript
MediumEditor.extensions.keyboardCommands = MediumEditor.Extension.extend({
  // ...
  init: function () {
    MediumEditor.Extension.prototype.init.apply(this, arguments);

    this.subscribe('editableKeydown', this.handleKeydown.bind(this));
    // ...
  },
  // ...
});
```

***
### `trigger(name, data, editable)`

Calls [`MediumEditor.trigger(name, data, editable)`](../../../API.md#triggername-data-editable)

For example, the Toolbar Extension triggers the `hideToolbar` custom event whenever the toolbar is being hidden:

```javascript
MediumEditor.extensions.toolbar = MediumEditor.Extension.extend({
  // ...
  hideToolbar: function () {
    if (this.isDisplayed()) {
      this.getToolbarElement().classList.remove('medium-editor-toolbar-active');
      this.trigger('hideToolbar', {}, this.base.getFocusedElement());
    }
  },
  // ...
});
```

# Button

Buttons are a specific type of extension which will render a button into the toolbar, allowing for custom logic to run whenever the button is clicked.  The extension framework also allows the button extension to respond to the user's selection each time the selection changes to do things such as 'activate/deactivate' the button.  This allows for things like having the Bold button be 'activated' whenever the user's selection includes already bold text, or 'inactive' if the selection is not already bold.

***
## Button Interface

The only method that defines an extension as a **Button Extension** is the `getButton()` method. As long as the name of the **Button Extension** is passed via the `toolbar.buttons` option, and the `getButton()` method is implemented, then the toolbar will treat the extension as a **Button Extension**

### `getButton()`

If the name of an extension appears in the `toolbar.buttons` option, the MediumEditor toolbar will attempt to call this `getButton()` method on the extension. The `HTMLElement` returned by this method will be appended to the toolbar.

The `getButton()` method on each button will be called and appended to the toolbar in the order that they were specified in the `toolbar.buttons` option.

***
## Button Helpers

The following are properties and methods of the built-in button extension implementation (`MediumEditor.extensions.button`) that can be reused and/or overriden to make custom button extensions easier to create.

### `action` _(string)_

By default, the action argument to pass to MediumEditor.execAction() when the button is clicked.

The value of this will also be set as the value of the `data-action` attribute which will be set on the button.

**Example:**

The following would create a custom button extension which would 'bold' text via the built-in 'bold' support in the browser:

```js
var CustomButtonExtension = MediumEditor.extensions.button.extend({
  name: 'custom-button-extension',

  action: 'bold'

  // ... other properties/methods ...
})
```

***
### `aria` _(string)_

The value to add as both the `aria-label` and `title` attributes of the button.

**Example:**

The following would create a custom button extension which would have `'bold text'` as both the `aria-label` and the `title` attribute of the button in the toolbar:

```js
var CustomButtonExtension = MediumEditor.extensions.button.extend({
  name: 'custom-button-extension',

  aria: 'bold text'

  // ... other properties/methods ...
})
```

***
### `tagNames` _(Array)_

Array of element tag names that would indicate that this button has already been applied. If this action has already been applied, the button will be displayed as 'active' in the toolbar.

**NOTE:**

`tagNames` is not used if `useQueryState` is set to `true`.

**Example:**

The following would create a custom button extension which would be 'active' in the toolbar if the selection is within a `<b>` or a `<strong>` tag:

```js
var CustomButtonExtension = MediumEditor.extensions.button.extend({
  name: 'custom-button-extension',

  useQueryState: false,

  tagNames: ['b', 'strong'],

  // ... other properties/methods ...
})
```

***
### `style` _(Object)_

A pair of css property & value(s) that indicate that this button has already been applied. If this action has already been applied, the button will be displayed as 'active' in the toolbar.

**Properties of this object:**

* **prop** *[String]*: name of the css property
* **value** *[String]*: value(s) of the css property (multiple values can be separated by a '|')

**NOTE:**

`style` is not used if `useQueryState` is set to `true`.

**Example:**

The following would create a custom button extension which would be 'active' in the toolbar if the `font-weight` was either `700` of `'bold'`:

```js
var CustomButtonExtension = MediumEditor.extensions.button.extend({
  name: 'custom-button-extension',

  useQueryState: false,

  style: {
    prop: 'font-weight',
    value: '700|bold'
  },

  // ... other properties/methods ...
})
```

***
### `useQueryState` _(boolean)_

Enables/disables whether this button should use the built-in `document.queryCommandState()` method to determine whether the action has already been applied.  If the action has already been applied, the button will be displayed as 'active' in the toolbar.

**Example:**

The following would create a custom button extension which would be enabled if the browser decided the text was 'bold':

```js
var CustomButtonExtension = MediumEditor.extensions.button.extend({
  name: 'custom-button-extension',

  action: 'bold',
  useQueryState: true,

  // ... other properties/methods ...
})
```

For Example: For 'bold', if this is set to true, the code will call `document.queryCommandState('bold')` which will return `true` if the browser thinks the text is already bold, and `false` otherwise.

***
### `contentDefault` _(string)_

Default innerHTML to put inside the button

***
### `contentFA` _(string)_

The innerHTML to use for the content of the button if the `buttonLabels` option for MediumEditor is set to `'fontawesome'`

**Example:**

The following is pulled from the HighlightButton example, which defines a button for both the default case, and when `fontawesome` icons are being used.

```js
var CustomButtonExtension = MediumEditor.extensions.button.extend({
  name: 'custom-button-extension',

  contentDefault: '<b>H</b>',
  contentFA: '<i class="fa fa-paint-brush"></i>',

  // ... other properties/methods ...
})
```

***
### `classList` _(Array)_

An array of classNames (strings) to be added to the button.

**Example:**

The following would create a custom button extension where the button element in the toolbar would have both a `custom-button` and a `custom-extension` class:

```js
var CustomButtonExtension = MediumEditor.extensions.button.extend({
  name: 'custom-button-extension',

  classList: ['custom-button', 'custom-extension'],

  // ... other properties/methods ...
})
```

***
### `attrs` _(Object)_

A set of key-value pairs to add to the button as custom attributes.

**Example:**

The following would create a custom button extension where the button element in the toolbar would have a `data-is-custom` attribute set to `true`:

```js
var CustomButtonExtension = MediumEditor.extensions.button.extend({
  name: 'custom-button-extension',

  attrs: {
    'data-is-custom': 'true'
  },

  // ... other properties/methods ...
})
```

***
### `handleClick(event)` _(function)_

The event listener called when the button is clicked.  The default built-in button will call `this.execAction(action)` when the button is clicked.

**Example:**

The following would create a custom button extension where the button would prompt the user for an action to execute:

```js
var CustomButtonExtension = MediumEditor.extensions.button.extend({
  name: 'custom-button-extension',

  handleClick: function (event) {
    var action = prompt("Please enter an action", "bold");
    if (action) {
      this.execAction(action);
    }
  },

  // ... other properties/methods ...
})
```

# Form Button

## Form Button Interface

## Form Button Helpers
