# Walkthrough - Building an Extension

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [DisableContextMenuExtension](#disablecontextmenuextension)
  - [1. Define the Extension](#1-define-the-extension)
  - [2. Attaching To Context Menu Event](#2-attaching-to-context-menu-event)
  - [3. Adding Functionality](#3-adding-functionality)
  - [4. Leveraging Custom Event Listeners](#4-leveraging-custom-event-listeners)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## DisableContextMenuExtension

You can find a demo of this example in the source code via [extension-example.html](../../../demo/extension-example.html).

To interact with the demo, load the page from your fork in a browser via: 

`file://[Medium Editor Source Root]/demo/extension-example.html`

### 1. Define the Extension

As a simple example, let's create an extension that disables the context menu from appearing when the user right-clicks on the editor.

Defining this extension is as simple as calling `MediumEditor.Extension.extend()` and passing in the methods/properties we want to override.

```js
var DisableContextMenuExtension = MediumEditor.Extension.extend({
  name: 'disable-context-menu'
});
```

We now have an extension named `'disable-context-menu'` which we can pass into MediumEditor like this:

```js
var editor = new MediumEditor('.editable', {
  extensions: {
    'disable-context-menu': new DisableContextMenuExtension()
  }
});
```

***
### 2. Attaching To Context Menu Event

To make the extension actually do something, we'll want to attach to the `contextmenu` event on all **elements** of the editor.  We can set this up by implementing the `init()` method, which is called on every Extension during setup of MediumEditor:

```js
var DisableContextMenuExtension = MediumEditor.Extension.extend({
  name: 'disable-context-menu',

  init: function () {
    this.getEditorElements().forEach(function (element) {
      this.base.on(element, 'contextmenu', this.handleContextmenu.bind(this));
    }, this);
  },

  handleContextmenu: function (event) { }
});
```

Here, we're leveraging some of the helpers that are available to all Extensions.

* We're using `this.getEditorElements()`, which is a helper function to give us an array containing all **elements** maintained by this editor.
* We're using `this.base`, which is a reference to the MediumEditor instance.
* We're using `this.base.on()`, which is a [method of MediumEditor](../../../API.md#ontarget-event-listener-usecapture) for attaching to DOM Events. Using this method ensures our event handlers will be detached when MediumEditor is destroyed.

**NOTE:**

* There are a few helper methods that allow us to make calls directly into the MediumEditor instance without having to reference `this.base`. One of them is a reference to the `on()` method, so instead of the above code we can just use `this.on(element, 'contextmenu', this.handleContextmenu.bind(this))` which is what we'll use in the rest of the example.

***
### 3. Adding Functionality

So, the last piece we need is to handle the `contextmenu` event and prevent the default action:

```js
var DisableContextMenuExtension = MediumEditor.Extension.extend({
  name: 'disable-context-menu',

  init: function () {
    this.getEditorElements().forEach(function (element) {
      this.base.on(element, 'contextmenu', this.handleContextmenu.bind(this));
    }, this);
  },

  handleContextmenu: function (event) {
    event.preventDefault();
  }
});
```

Now we have a working extension which prevents the context menu from showing up for any of the **elements**.  Let's add some more functionality to allow for toggling this feature on and off.

***
### 4. Leveraging Custom Event Listeners

Let's say we wanted to support toggling on/off the disable-context-menu extension, for a specific **element**, whenever the user presses ESCAPE.  To do this, we'll need to add 2 pieces of functionality:

1. Listen to the `keydown` event on each **element**. For this, we can leverage the built-in [`editableKeyDown` custom event](../../../CUSTOM-EVENTS.md#editablekeydown).  This allows us to use the 2nd argument of custom event listeners (the active editor **element**) to toggle on/off a `data-allow-context-menu` attribute on the **element**.

2. When the `contextmenu` event fires, we only want to prevent the context menu from appearing if the `data-allow-context-menu` attribute is not present.

```js
var DisableContextMenuExtension = MediumEditor.Extension.extend({
  name: 'disable-context-menu',

  init: function () {
    this.getEditorElements().forEach(function (element) {
      this.on(element, 'contextmenu', this.handleContextmenu.bind(this));
    }, this);
    this.subscribe('editableKeydown', this.handleKeydown.bind(this));
  },

  handleContextmenu: function (event) {
    if (!event.currentTarget.getAttribute('data-allow-context-menu')) {
      event.preventDefault();
    }
  },

  handleKeydown: function (event, editable) {
    // If the user hits escape, toggle the data-allow-context-menu attribute
    if (MediumEditor.util.isKey(event, MediumEditor.util.keyCode.ESCAPE)) {
      if (editable.hasAttribute('data-allow-context-menu')) {
        editable.removeAttribute('data-allow-context-menu');
      } else {
        editable.setAttribute('data-allow-context-menu', true);
      }
    }
  }
});
```

**NOTE:**

For events like `keydown`, we could always use `currentTarget` and not need to use the reference to the editable element (like how we use the `currentTarget` when handling the `contextmenu` event).  However, there may be times when we want to trigger one of these events manually, and this allows us to specify exactly which editable element we want to trigger the event for.  It's also a handy standardization for events which are more complicated, like the custom `focus` and `blur` events.