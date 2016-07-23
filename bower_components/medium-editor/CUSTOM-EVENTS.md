# MediumEditor Custom Events (v5.0.0)

MediumEditor exposes a variety of custom events for convenience when using the editor with your web application.  You can attach and detach listeners to these custom events, as well as manually trigger any custom events including your own custom events.

**NOTE:**

Custom event listeners are triggered in the order that they were 'subscribed' to.  Most functionality within medium-editor uses these custom events to trigger updates, so in general, it can be assumed that most of the built-in functionality has already been completed before any of your custom event listeners will be called.

If you need to override the editor's built-in behavior, try overriding the built-in extensions with your own [custom extension](src/js/extensions).

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [API Methods](#api-methods)
  - [`MediumEditor.subscribe(name, listener)`](#mediumeditorsubscribename-listener)
  - [`MediumEditor.unsubscribe(name, listener)`](#mediumeditorunsubscribename-listener)
  - [`MediumEditor.trigger(name, data, editable)`](#mediumeditortriggername-data-editable)
- [Custom Events](#custom-events)
  - [`addElement`](#addelement)
  - [`blur`](#blur)
  - [`editableInput`](#editableinput)
  - [`externalInteraction`](#externalinteraction)
  - [`focus`](#focus)
  - [`removeElement`](#removeelement)
- [Toolbar Custom Events](#toolbar-custom-events)
  - [`hideToolbar`](#hidetoolbar)
  - [`positionToolbar`](#positiontoolbar)
  - [`positionedToolbar`](#positionedtoolbar)
  - [`showToolbar`](#showtoolbar)
- [Proxied Custom Events](#proxied-custom-events)
      - [`editableClick`](#editableclick)
      - [`editableBlur`](#editableblur)
      - [`editableKeypress`](#editablekeypress)
      - [`editableKeyup`](#editablekeyup)
      - [`editableKeydown`](#editablekeydown)
      - [`editableKeydownEnter`](#editablekeydownenter)
      - [`editableKeydownTab`](#editablekeydowntab)
      - [`editableKeydownDelete`](#editablekeydowndelete)
      - [`editableKeydownSpace`](#editablekeydownspace)
      - [`editableMouseover`](#editablemouseover)
      - [`editableDrag`](#editabledrag)
      - [`editableDrop`](#editabledrop)
      - [`editablePaste`](#editablepaste)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## API Methods

Use the following methods of [MediumEditor](API.md) for custom event interaction:

### `MediumEditor.subscribe(name, listener)`

Attaches a listener for the specified custom event name.

**Arguments**

1. _**name** (`String`)_:

  * Name of the event to listen to.  See the list of built-in [Custom Events](#custom-events) below.

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
### `MediumEditor.unsubscribe(name, listener)`

Detaches a custom event listener for the specified custom event name.

**Arguments**

1. _**name** (`String`)_:

  * Name of the event to detach the listener for.

2. _**listener** (`function`)_:

  * A reference to the listener to detach.  This must be a match by-reference and not a copy.

**NOTE**

  * Calling [destroy()](API.md#destroy) on the MediumEditor object will automatically remove all custom event listeners.

***
### `MediumEditor.trigger(name, data, editable)`

Manually triggers a custom event.

1. _**name** (`String`)_:

  * Name of the custom event to trigger.

2. _**data** (`Event` | `object`)_:

  * Native `Event` object or custom data object to pass to all the listeners to this custom event.

3. _**editable** (`HTMLElement`)_:

  * The `<div contenteditable=true></div>` element to pass to all of the listeners to this custom event.

## Custom Events

These events are custom to MediumEditor so there may be one or more native events that can trigger them.

### `addElement`

`addElement` is triggered whenever an element is added to the editor after the editor has been instantiated.  This custom event will be triggered **after** the element has already been initialized by the editor and added to the internal array of **elements**.  If the element being added was a `<textarea>`, the element passed to the listener will be the created `<div contenteditable=true>` element and not the root `<textarea>`.

**Arguments to listener**

1. _**data** (`object`)_
  * Properties of data object
    * `target`: element which was added to the editor
    * `currentTarget`: element which was added to the editor
2. _**editable** (`HTMLElement`)_
  * element which was added to the editor

***
### `blur`

`blur` is triggered whenever a `contenteditable` element within an editor has lost focus to an element other than an editor maintained element (ie Toolbar, Anchor Preview, etc).

Example:

1. User selects text within an editor element, causing the toolbar to appear
2. User clicks on a toolbar button
  * Technically focus may have been lost on the editor element, but since the user is interacting with the toolbar, `blur` is NOT fired.
3. User hovers over a link, anchor-preview is displayed
4. User clicks link to edit it, and the toolbar now displays a textbox to edit the url
  * Focus will have lost here since focus is now in the url editing textbox, but again since it's within the toolbar, `blur` is NOT fired.
5. User clicks on another part of the page which hides the toolbar and focus is no longer in the `contenteditable`
6. `blur` is triggered

***
### `editableInput`

`editableInput` is triggered whenever the content of a `contenteditable` changes, including keypresses, toolbar actions, or any other user interaction that changes the html within the element.  For non-IE browsers, this is just a proxied version of the native `input` event.  However, Internet Explorer and has never supported the `input` event on `contenteditable` elements, and Edge has some support for `input` on `contenteditable` (which may be fixed in upcoming release of Edge) so for these browsers the `editableInput` event is triggered through a combination of:
* native `keypress` event on the element
* native `selectionchange` event on the document
* monitoring calls the `document.execCommand()`

***
### `externalInteraction`

`externalInteraction` is triggered whenever the user interact with any element outside of the `contenteditable` element or the other elements maintained by the editor (ie Toolbar, Anchor Preview, etc.).  This event trigger regardless of whether an existing `contenteditable` element had focus or not.

***
### `focus`

`focus` is triggered whenever a `contenteditable` element within an editor receives focus. If the user interacts with any editor maintained elements (ie toolbar), `blur` is NOT triggered because focus has not been lost.  Thus, `focus` will only be triggered when an `contenteditable` element (or the editor that contains it) is first interacted with.

***
### `removeElement`

`removeElement` is triggered whenever an element is removed from the editor after the editor has been instantiated.  This custom event will be triggered **after** the element has already been removed from the editor and any events attached to it have already been removed.  If the element being removed was a `<div>` created to correspond to a `<textarea>`, the element will already have been removed from the DOM.

**Arguments to listener**

1. _**data** (`object`)_
  * Properties of data object
    * `target`: element which was removed from the editor
    * `currentTarget`: element which was removed from the editor
2. _**editable** (`HTMLElement`)_
  * element which was removed from the editor

## Toolbar Custom Events

These events are triggered by the toolbar when the toolbar extension has not been disabled.

### `hideToolbar`

`hideToolbar` is triggered whenever the toolbar was visible and has just been hidden.

### `positionToolbar`
`positionToolbar` is triggered each time the current selection is checked and the toolbar's position is about to be updated. This event is triggered after all of the buttons have had their state updated, but before the toolbar is moved to the correct location.  This event will be triggered even if nothing will be changed about the toolbar's appearance.

### `positionedToolbar`
`positionedToolbar` is triggered each time the current selection is checked, the toolbar is displayed, and the toolbar's position was updated. This differs from the `positionToolbar` event in that the visibility and location of the toolbar has already been changed (as opposed to the event triggering before those changes occur). This event will be triggered even if nothing was changed about the toolbar's appearance.

### `showToolbar`
`showToolbar` is triggered whenever the toolbar was hidden and has just been displayed.

## Proxied Custom Events

These events are triggered whenever a native browser event is triggered for any of the `contenteditable` elements monitored by this instance of MediumEditor.

For example, the `editableClick` custom event will be triggered when a native `click` event is fired on any of the `contenteditable` elements. This provides a single event listener that can get fired for all elements, and also allows for the `contenteditable` element that triggered the event to be passed to the listener.

##### `editableClick`
native `click` event for each element
##### `editableBlur`
native `blur` event for each element.
##### `editableKeypress`
native `keypress` event for each element.
##### `editableKeyup`
native `keyup` event for each element.
##### `editableKeydown`
native `keydown` event for each element.
##### `editableKeydownEnter`
native `keydown` event for each element, but only triggered if the key is `ENTER` (keycode 13).
##### `editableKeydownTab`
native `keydown` event for each element, but only triggered if the key is `TAB` (keycode 9).
##### `editableKeydownDelete`
native `keydown` event for each element, but only triggered if the key is `DELETE` (keycode 46).
##### `editableKeydownSpace`
native `keydown` event for each element, but only triggered if the key is `SPACE` (keycode 32).
##### `editableMouseover`
native `mouseover` event for each element.
##### `editableDrag`
native `drag` event for each element.
##### `editableDrop`
native `drop` event for each element.
##### `editablePaste`
native `paste` event for each element.
