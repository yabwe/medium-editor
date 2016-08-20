# MediumEditor Object API (v5.0.0)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Initialization Functions](#initialization-functions)
  - [`MediumEditor(elements, options)`](#mediumeditorelements-options)
  - [`destroy()`](#destroy)
  - [`setup()`](#setup)
  - [`addElements()`](#addelementselements)
  - [`removeElements()`](#removeelementselements)
- [Event Functions](#event-functions)
  - [`on(targets, event, listener, useCapture)`](#ontargets-event-listener-usecapture)
  - [`off(targets, event, listener, useCapture)`](#offtargets-event-listener-usecapture)
  - [`subscribe(name, listener)`](#subscribename-listener)
  - [`unsubscribe(name, listener)`](#unsubscribename-listener)
  - [`trigger(name, data, editable)`](#triggername-data-editable)
- [Selection Functions](#selection-functions)
  - [`checkSelection()`](#checkselection)
  - [`exportSelection()`](#exportselection)
  - [`importSelection(selectionState, favorLaterSelectionAnchor)`](#importselectionselectionstate-favorlaterselectionanchor)
  - [`getFocusedElement()`](#getfocusedelement)
  - [`getSelectedParentElement(range)`](#getselectedparentelementrange)
  - [`restoreSelection()`](#restoreselection)
  - [`saveSelection()`](#saveselection)
  - [`selectAllContents()`](#selectallcontents)
  - [`selectElement(element)`](#selectelementelement)
  - [`stopSelectionUpdates()`](#stopselectionupdates)
  - [`startSelectionUpdates()`](#startselectionupdates)
- [Editor Action Functions](#editor-action-functions)
  - [`cleanPaste(text)`](#cleanpastetext)
  - [`createLink(opts)`](#createlinkopts)
  - [`execAction(action, opts)`](#execactionaction-opts)
  - [`pasteHTML(html, options)`](#pastehtmlhtml-options)
  - [`queryCommandState(action)`](#querycommandstateaction)
- [Helper Functions](#helper-functions)
  - [`checkContentChanged(editable)`](#checkContentChangededitable)
  - [`delay(fn)`](#delayfn)
  - [`getContent(index)`](#getcontentindex)
  - [`getExtensionByName(name)`](#getextensionbynamename)
  - [`resetContent(element)`](#resetcontentelement)
  - [`serialize()`](#serialize)
  - [`setContent(html, index)`](#setcontenthtml-index)
- [Static Functions/Properties](#static-functionsproperties)
  - [`getEditorFromElement(element)`](#geteditorfromelementelement)
  - [`version`](#version)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Initialization Functions

### `MediumEditor(elements, options)`

Creating an instance of MediumEditor will:
* Convert all passed in elements into `contenteditable` elements.
* For any `<textarea>` elements:
  * Hide the `<textarea>`
  * Create a new `<div contenteditable=true>` element and add it to the elements array.
  * Ensure the 2 elements remain sync'd.
* Initialize any custom extensions or buttons passed in.
* Create any additional elements needed.
* Setup all event handling needed to monitor the editable elements.

**Arguments**

_**elements** (`String` | `HTMLElement` | `Array` | `NodeList` | `HTMLCollection`)_:

1. `String`: If passed as a string, this is used as a selector in a call to `document.querySelectorAll()` to find elements on the page.  All results are stored in the internal list of **elements**.

2. `HTMLElement`: If passed as a single element, this will be the only element in the internal list of **elements**.

3. `Array`: If passed as an `Array` of `HTMLElement`s, this will be used as the internal list of **elements**.

_**options** (`Object`)_:

Set of [custom options](OPTIONS.md) used to initialize `MediumEditor`.

***
### `destroy()`

Tear down the editor if already setup by doing the following:
* Calling the `destroy()` method on each extension within the editor. This should allow all extension to be torn down and cleaned up, including the toolbar and its elements.
* Detaching all event listeners from the DOM
* Detaching all references to custom event listeners
* Remove any custom attributes from the editor **elements**
* Unhide any `<textarea>` elements and remove any created `<div>` elements created for `<textarea>` elements.

***
### `setup()`

Initialize this instance of the editor if it has been destroyed.  This will reuse the `elements` selector and `options` object passed in when the editor was instantiated.

***
### `addElements(elements)`

Dynamically add one or more elements to an already initialized instance of MediumEditor.

Passing an elements or array of elements to `addElements(elements)` will:
* Add the given element or array of elements to the editor **elements**
* Ensure the element(s) are initialized with the proper attributes and event handlers as if the element had been passed during instantiation of the editor
* For any `<textarea>` elements:
  * Hide the `<textarea>`
  * Create a new `<div contenteditable=true>` element and add it to the editor **elements**
  * Ensure the 2 elements remain sync'd.
* Be intelligent enough to run the necessary code only once per element, no matter how often you will call it

So, every element you pass to `addElements` will turn into a fully supported contenteditable too - even earlier calls to `editor.subscribe(..)`
for custom events will work on the newly added element(s).

**Arguments**

_**elements** (`String` | `HTMLElement` | `Array` | `NodeList` | `HTMLCollection`)_:

1. `String`: If passed as a string, this is used as a selector in a call to `document.querySelectorAll()` to find elements on the page.

2. `HTMLElement`: If passed as a single element, this will be the only element added to the editor **elements**.

3. `Array` | `NodeList` | `HTMLCollection`: If passed as an `Array`-like collection of `HTMLElement`s, all of these elements will be added to the editor **elements**.

***
### `removeElements(elements)`

Remove one or more elements from an already initialized instance of MediumEditor.

Passing an elements or array of elements to `removeElements(elements)` will:
* Remove the given element or array of elements from the internal `this.elements` array.
* Remove any added event handlers or attributes (with the exception of `contenteditable`).
* Unhide any `<textarea>` elements and remove any created `<div>` elements created for `<textarea>` elements.

Each element itself will remain a contenteditable - it will just remove all event handlers and all references to it so you can safely remove it from DOM.

**Arguments**

_**elements** (`String` | `HTMLElement` | `Array` | `NodeList` | `HTMLCollection`)_:

1. `String`: If passed as a string, this is used as a selector in a call to `document.querySelectorAll()` to find elements on the page.

2. `HTMLElement`: If passed as a single element, this will be the only element removed from the editor **elements**.

3. `Array` | `NodeList` | `HTMLCollection`: If passed as an `Array`-like collection of `HTMLElement`s, all of these elements will be removed from the editor **elements**.

***
## Event Functions

### `on(targets, event, listener, useCapture)`

Attaches an event listener to a specific element or elements via the browser's built-in `addEventListener(type, listener, useCapture)` API.  However, this helper method also ensures that when MediumEditor is destroyed, this event listener will be automatically be detached from the DOM.

**Arguments**

1. _**targets** (`HTMLElement` / `NodeList`)_:

  * Element or elements to attach listener to via `addEventListener(type, listener, useCapture)`

2. _**event** (`String`)_:

  * type argument for `addEventListener(type, listener, useCapture)`

3. _**listener** (`function`)_:

   * listener argument for `addEventListener(type, listener, useCapture)`

4. _**useCapture** (`boolean`)_:

   * useCapture argument for `addEventListener(type, listener, useCapture)`

***
### `off(targets, event, listener, useCapture)`

Detach an event listener from a specific element or elements via the browser's built-in `removeEventListener(type, listener, useCapture)` API.

**Arguments**

1. _**targets** (`HTMLElement` / `NodeList`)_:

  * Element or elements to detach listener from via `removeEventListener(type, listener, useCapture)`

2. _**event** (`String`)_:

  * type argument for `removeEventListener(type, listener, useCapture)`

3. _**listener** (`function`)_:

   * listener argument for `removeEventListener(type, listener, useCapture)`

4. _**useCapture** (`boolean`)_:

   * useCapture argument for `removeEventListener(type, listener, useCapture)`

***
### `subscribe(name, listener)`

Attaches a listener for the specified custom event name.

**Arguments**

1. _**name** (`String`)_:

  * Name of the event to listen to.  See the list of built-in [Custom Events](CUSTOM-EVENTS.md).

2. _**listener(data, editable)** (`function`)_:

  * Listener method that will be called whenever the custom event is triggered.

**Arguments to listener**

  1. _**data** (`Event` | `object`)_
    * For most custom events, this will be the browser's native `Event` object for the event that triggered the custom event to fire.
    * For some custom events, this will be an object containing information describing the event (depending on which custom event it is)
  2. _**editable** (`HTMLElement`)_
    * A reference to the contenteditable container element that this custom event corresponds to.  This is especially useful for instances where one instance of MediumEditor contains multiple elements, or there are multiple instances of MediumEditor on the page.
    * For example, when `blur` fires, this argument will be the `<div contenteditable=true></div>` element that is about to receive focus.

***
### `unsubscribe(name, listener)`

Detaches a custom event listener for the specified custom event name.

**Arguments**

1. _**name** (`String`)_:

  * Name of the event to detach the listener for.

2. _**listener** (`function`)_:

  * A reference to the listener to detach.  This must be a match by-reference and not a copy.

**NOTE**

  * Calling [destroy()](#destroy) on the MediumEditor object will automatically remove all custom event listeners.

***
### `trigger(name, data, editable)`

Manually triggers a custom event.

**Arguments**

1. _**name** (`String`)_:

  * Name of the custom event to trigger.

2. _**data** (`Event` | `object`)_:

  * Native `Event` object or custom data object to pass to all the listeners to this custom event.

3. _**editable** (`HTMLElement`)_:

  * The `<div contenteditable=true></div>` element to pass to all of the listeners to this custom event.

***
## Selection Functions

### `checkSelection()`

If the toolbar is enabled, manually forces the toolbar to update based on the user's current selection.  This includes hiding/showing the toolbar, positioning the toolbar, and updating the enabled/disable state of the toolbar buttons.

***
### `exportSelection()`

Returns a data representation of the selected text, which can be applied via `importSelection(selectionState)`.  This data will include the beginning and end of the selection, as well as which of the editor **elements** the selection was within.

***
### `importSelection(selectionState, favorLaterSelectionAnchor)`

Restores the selection using a data representation of previously selected text (ie value returned by `exportSelection()`).

**Arguments**

1. _**selectionState** (`Object`)_:

  * Data representing the state of the selection to restore.

2. _**favorLaterSelectionAnchor** (`boolean`)_:

  * If `true`, import the cursor immediately subsequent to an anchor tag if it would otherwise be placed right at the trailing edge inside the anchor. THis cursor positioning, even though visually equivalent to the user, can affect behavior in Internet Explorer.

***
### `getFocusedElement()`

Returns a reference to the editor **element** that currently has focus (if the editor has focus).

***
### `getSelectedParentElement(range)`

Returns a reference to the editor **element** that the user's selection is currently within.

**Arguments**

1. _**range** (`Range`)_: _**OPTIONAL**_
  * The `Range` to find the selection parent element within
  * If no element is provided, the editor will use the current range within the selection of the editor's `contentWindow`

***
### `restoreSelection()`

Restores the selection to what was selected the last time `saveSelection()` was called.

***
### `saveSelection()`

Internally stores the user's current selection.  This can be restored by calling `restoreSelection()`.

***
### `selectAllContents()`

Expands the selection to contain all text within the focused editor **element**.

***
### `selectElement(element)`

Change the user's selection to select the contents of the provided element and update the toolbar to reflect this change.

**Arguments**

1. _**element** (`HTMLElement`)_:

  * DOM Element -- which is a descendant of one of the editor's **elements** -- to select.

***
### `stopSelectionUpdates()`

Stop the toolbar from updating to reflect changes in the user's selection.

***
### `startSelectionUpdates()`

Enable the toolbar to start updating based on the user's selection, after a call to `stopSelectionUpdates()`

***
## Editor Action Functions

### `cleanPaste(text)`
_convert text to plaintext and replace current selection with result_

**Arguments**

1. _**text** (`String`)_:

  * Content to be pasted at the location of the current selection/cursor

***
### `createLink(opts)`
_creates a link via the native `document.execCommand('createLink')` command_

**Arguments**

1. _**opts** (`Object`)_:

  * Object containing additional properties needed for creating a link

  **Properties of 'opts'**

    1. _**value** (`String`)_ _**REQUIRED**_
      * The url to set as the `href` of the created link.  A non-empty value must be provided for the link to be created.
    2. _**target** (`String`)_
      * Attribute to set as the `target` attribute of the created link.  Passing 'self' or not passing this option at all are equivalent in that they will just ensure that `target="_blank"` will NOT be present on the created link.
      * **NOTE** If the `targetBlank` option on the editor is set to true, the `target` property of opts will be ignored and `target="_blank"` will be added to all created links.
    3. _**buttonClass** (`String`)_
      * Class (or classes) to append to the `class` attribute of the created link.

##### Example

```js
editor.createLink({ value: 'https://github.com/yabwe/medium-editor', target: '_blank', buttonClass: 'medium-link' });
```

***
### `execAction(action, opts)`
_executes an built-in action via document.execCommand_

**Arguments**

1. _**action** (`String`)_:

  * Action to be passed as the 'command' argument to `document.execCommand(command, showDefaultUI, value)`

2. _**opts** (`Object`)_ _**OPTIONAL**_:

  * Object containing additional properties for specific commands

  **Properties of 'opts'**

    1. _**value** (`String`)_
      * The value to pass as the 'value' argument to `document.execCommand(command, showDefaultUI, value)`
    2. For 'createLink', the `opts` are passed directly to [`.createLink(opts)`]((#createlinkopts)) so see that method for additional options for that command

***
### `pasteHTML(html, options)`
_replace the current selection with html_

**Arguments**

1. _**html** (`String`)_:

  * Content to be pasted at the location of the current selection/cursor

2. _**options** (`Object`)_ _**OPTIONAL**_:

  * Optional overrides for `cleanTags`, `unwrapTags`, and/or `cleanAttrs` for removing/unwrapping specific element types (`cleanTags`/`unwrapTags`),  or removing specific attributes (`cleanAttrs`) from the inserted HTML.  See [cleanTags](OPTIONS.md#cleantags), [unwrapTags](OPTIONS.md#unwraptags), and [cleanAttrs](OPTIONS.md#cleanattrs) in OPTIONS.md for more information.

##### Example

```js
editor.pasteHTML('<p class="classy"><strong>Some Custom HTML</strong></p>', { cleanAttrs: ['class'], cleanTags: ['strong'], unwrapTags: ['em']});
```

***
### `queryCommandState(action)`
_wrapper around the browser's built in `document.queryCommandState(command)` for checking whether a specific action has already been applied to the selection._

**Arguments**

1. _**action** (`String`)_:

  * Action to be passed as the 'command' argument to `document.queryCommandState(command)`

***
## Helper Functions

### `checkContentChanged(editable)`

Trigger the editor to check for updates to the html, and trigger the `editableInput` event if needed.

**Arguments**

1. _**editable** (`HTMLElement`)_: _**OPTIONAL**_
  * The `<div contenteditable=true></div>` element that contains the html that may have changed.
  * If no element is provided, the editor will check the currently 'active' editor element (the element with focus).

### `delay(fn)`

Delay any function from being executed by the amount of time passed as the **delay** option.

**Arguments**

1. _**fn** (`function`)_:

  * Function to delay execution for.

***
### `getContent(index)`

Returns the trimmed html content for the first editor **element**, or the **element** at `index`.

**Arguments**

1. _**index** (`integer`)_: _**OPTIONAL**_
  * Index of the editor **element** to retrieve the content from. Defaults to 0 when not provided (returns content of the first editor **element**).

***
### `getExtensionByName(name)`

Get a reference to an extension with the specified name.

**Arguments**

1. _**name** (`String`)_:

  * The name of the extension to retrieve (ie `toolbar`).

***
### `resetContent(element)`

Reset the content of all editor **elements** to their value at the time they were added to the editor.  If a specific editor **element** is provided, only the content of that element will be reset.

**Arguments**

1. _**element** (`DOMElement`)_: _**OPTIONAL**_

  * Specific editor **element** to reset the content of.

***
### `serialize()`

Returns a JSON object including the content of each of the **elements** inside the editor.

***
### `setContent(html, index)`

Sets the html content for the first editor **element**, or the **element** at `index`. Ensures the the `editableInput` event is triggered.

**Arguments**

1. _**html** (`string`)_:
  * The content to set the element to

2. _**index** (`integer`)_: _**OPTIONAL**_
  * Index of the editor **element** to set the content of. Defaults to 0 when not provided (sets content of the first editor **element**).

***
## Static Functions/Properties

### `getEditorFromElement(element)`

Given an editor **element**, retrieves the instance of MediumEditor which created/is monitoring the **element**

**Arguments**

1. _**element** (`DOMElement`)_:
  * An editor **element** which is part of a MediumEditor instance

### `version`

Object containing data about the version of the current MediumEditor library

**Properties of 'version'**

1. _**major** (`Number`)_
  * The major version number (ie the `3` in `"3.2.1"`)
2. _**minor** (`Number`)_
  * The minor version number (ie the `2` in `"3.2.1"`)
3. _**revision** (`Number`)_
  * The revision (aka "patch") version number (ie the `1` in `"3.2.1"`)
4. _**preRelease** (`String`)_
  * The pre-release version tag (ie the `"rc.1"` in `"5.0.0-rc.1"`)
5. _**toString** (`Function`)_
  * Returns the full version number as a string (ie `"5.0.0-rc.1"`)
