# MediumEditor Object API (v5.0.0)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Initialization Functions](#initialization-functions)
  - [`MediumEditor(elements, options)`](#mediumeditorelements-options)
  - [`destroy()`](#destroy)
  - [`setup()`](#setup)
- [Event Functions](#event-functions)
  - [`on(target, event, listener, useCapture)`](#ontarget-event-listener-usecapture)
  - [`off(target, event, listener, useCapture)`](#offtarget-event-listener-usecapture)
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
  - [`delay(fn)`](#delayfn)
  - [`getExtensionByName(name)`](#getextensionbynamename)
  - [`serialize()`](#serialize)
  - [`setContent(html, index)`](#setcontenthtml-index)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Initialization Functions

### `MediumEditor(elements, options)`

Creating an instance of MediumEditor will:
* Convert all passed in elements into `contenteditable` elements.
* For any `<textarea>` elements, hide the `<textarea>`, create a new `<div contenteditable=true>` element, and ensure the 2 elements remain sync'd.
* Initialize any custom extensions or buttons passed in.
* Create any additional elements needed.
* Setup all event handling needed to monitor the editable elements.

**Arguments**

_**elements** (`String` | `HTMLElement` | `Array`)_:

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
## Event Functions

### `on(target, event, listener, useCapture)`

Attaches an event listener to specific element via the browser's built-in `addEventListener(type, listener, useCapture)` API.  However, this helper method also ensures that when MediumEditor is destroyed, this event listener will be automatically be detached from the DOM.

**Arguments**

1. _**target** (`HTMLElement`)_:

  * Element to attach listener to via `addEventListener(type, listener, useCapture)`

2. _**event** (`String`)_:

  * type argument for `addEventListener(type, listener, useCapture)`

3. _**listener** (`function`)_:

   * listener argument for `addEventListener(type, listener, useCapture)`

4. _**useCapture** (`boolean`)_:

   * useCapture argument for `addEventListener(type, listener, useCapture)`

***
### `off(target, event, listener, useCapture)`

Detach an event listener from a specific element via the browser's built-in `removeEventListener(type, listener, useCapture)` API.

**Arguments**

1. _**target** (`HTMLElement`)_:

  * Element to detach listener from via `removeEventListener(type, listener, useCapture)`

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

***
### `createLink(opts)`
_creates a link via the native `document.execCommand('createLink')` command_

***
### `execAction(action, opts)`
_executes an built-in action via document.execCommand_

***
### `pasteHTML(html, options)`
_replace the current selection with html_

***
### `queryCommandState(action)`
_wrapper around the browser's built in `document.queryCommandState(action)` for checking whether a specific action has already been applied to the selection._

***
## Helper Functions

### `delay(fn)`

Delay any function from being executed by the amount of time passed as the **delay** option.

**Arguments**

1. _**fn** (`function`)_:

  * Function to delay execution for.

***
### `getExtensionByName(name)`

Get a reference to an extension with the specified name.

**Arguments**

1. _**name** (`String`)_:

  * The name of the extension to retrieve (ie `toolbar`).

***
### `serialize()`

Returns a JSON object including the content of each of the **elements** inside the editor.

***
### `setContent(html, index)`

Sets the innerHTML content for the element at `index`.
Trigger the `editableInput` event.

**Arguments**

1. _**html** (`string`)_:
  * The content to set the element to

2. _**index** (`integer`)_:
  * Index of the element to set the content on. Defaults to 0 when not provided.
