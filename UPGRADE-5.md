# Upgrading to v5.0.0

Version 5.0.0 of MediumEditor introduces a significantly simpler system for building custom extensions as well as extending existing buttons and extensions. As part of moving towards this extendable model, there were significant changes to the way options are passed to MediumEditor, as well as the extensions and buttons themselves.

In addition to extension related changes, there were several other potential breaking changes related to API methods, as well as utility helper methods.

## MediumEditor Options

For details on all the currently supported MediumEditor options, refer to the [Medium Editor Options Wiki Page](https://github.com/yabwe/medium-editor/wiki/Options).

### Toolbar Options
* Options controlling the toolbar are now passed as a `'toolbar'` object inside the outer options object.
  * `buttons` -> `toolbar.buttons`
  * `toolbarAlign` -> `toolbar.align`
  * `diffTop` -> `toolbar.diffTop`
  * `diffLeft` -> `toolbar.diffLeft`
  * `staticToolbar` -> `toolbar.static`
  * `stickyToolbar` -> `toolbar.sticky`
  * `firstButtonClass` -> `toolbar.firstButtonClass`
  * `lastButtonClass` -> `toolbar.lastButtonClass`
  * `updateOnEmptySelection` -> `toolbar.updateOnEmptySelection`
  * `standardizeSelectionStart` -> `toolbar.standardizeSelectionStart`

### Anchor Options
* Options controlling the anchor input extension are now passed as a `'anchor'` object inside the outer options object.
  * `anchorInputPlaceholder` -> `anchor.placeholderText`
  * `checkLinkFormat` -> `anchor.linkValidation`
  * `anchorButton` & `anchorButtonClass` -> `anchor.customClassOption`
  * `anchorTarget` -> `anchor.targetCheckbox`
  * `anchorInputCheckboxLabel` -> `anchor.targetCheckboxText`

### Anchor Preview Options
* Options controlling the anchor preview extension are now passed as a `'anchorPreview'` object inside the outer options object.
  * `anchorPreviewHideDelay` -> `anchorPreview.hideDelay`

### Paste Options
* Options controlling paste are now passed as a `'paste'` object inside the outer options object.
  * `forcePlainText` -> `paste.forcePlainText`
  * `cleanPastedHTML` -> `paste.cleanPastedHTML`

### Placeholder Options
* Options controlling the placeholder extension are now passed as a `'placeholder'` object inside the outer options object.
  * `placeholder` -> `placeholder.text`

### Other Options

#### `disableToolbar`
* Disabling the toolbar extension is now done by setting the `toolbar` option to `false`

#### `disableAnchorPreview`
* Disabling the anchor preview extension is now done by setting the `anchorPreview` option to `false`

#### `disablePlaceholders`
* Disabling the placeholder extension is now done by setting the `placeholder` option to `false`

#### `onShowToolbar` & `onHideToolbar`
* The `onShowToolbar` and `onHideToolbar` options are no longer supported. Instead, attach to the `'showToolbar'` and `'hideToolbar'` [custom events](https://github.com/yabwe/medium-editor/wiki/Custom-Events) via `MediumEditor.subscribe()`

#### `firstHeader` & `secondHeader`
* The `firstHeader` & `secondHeader` options have been removed.  Instead, any number of the 6 header types can be passed as button names into the `toolbar.buttons` option array.
  * Example: Where before the code may have sent `firstHeader: 'h2'` and `secondHeader: 'h3'`, it should now pass `['bold', 'italic', 'quote', 'h2', 'h3']` via the `toolbar.buttons` property of the MediumEditor options object.

#### `buttonLabels`
* The `buttonLabels` option no longer supports taking an object in that specifies custom labels for all buttons. Instead, pass an object into the `toolbar.buttons` option array that contains a `.name` property for the name of the button, a either a `contentDefault` or a `contentFA` property that should be in the innerHTML of the button (for default of `fontawesome` buttonLabels respectively)


## MediumEditor Extensions
#### `.parent`
* `Extension.parent` is no longer supported.  All extensions will have a reference to the MediumEditor instance via their `.base` property, unless the property already exists.

#### `.init()`
* `Extension.init()` will no longer be passed any arguments. Previously, `.init(instance)` received an instance of MediumEditor as an argument, but this is not needed now that `.base` will be populated before `.init()` is called.

#### `.deactivate()`
* `Extension.deactivate()` will no longer be called by MediumEditor. `.destroy()` will be called instead when MediumEditor is destroyed.

#### `.options`
* The `.options` property of any built-in extensions or buttons has been removed.  All of the properties should be retrieved and set from the prototype of the object itself.
  * Example: Instead of buttons using `this.options.action`, they should now use `this.action`.
  * Not all extensions had options before, or saved them via the `.options` property.

## MediumEditor API

#### `.id`
* The unique identifier used for MediumEditor elements will now remain unique and remain regardless of how many instances are created. After calling `.destroy()` and `.setup()`, the id will remain the same. This id was used to generate unique element ids for things like the id attribute of the toolbar element (`'medium-editor-toolbar-[ID]'`)

#### `.toolbar`
* The MediumEditor toolbar is now an extension, so `MediumEditor.toolbar` is no longer a valid reference.  Use `MediumEditor.getExtensionByName('toolbar')` instead.

#### `.statics`
* All of the `.statics` references have been removed as the new style of extensions and buttons has been introduced. The objects exposed via `.statics` have also been changed, so code which uses them may require additonal changes.
  * `MediumEditor.statics.ButtonsData` -> `MediumEditor.extensions.button.prototype.defaults` (ideally this reference should no longer be needed)
  * `MediumEditor.statics.DefaultButton` -> `MediumEditor.extensions.button`
  * `MediumEditor.statics.AnchorExtension` -> `MediumEditor.extensions.anchor`
  * `MediumEditor.statics.FontSizeExtension` -> `MediumEditor.extensions.fontSize`
  * `MediumEditor.statics.Toolbar` -> `MediumEditor.extensions.toolbar`
  * `MediumEditor.statics.AnchorPreview` -> `MediumEditor.extensions.anchorPreview`

#### `.activate()`
* `MediumEditor.activate()` has been replaced with `MediumEditor.setup()`

#### `.deactivate()`
* `MediumEditor.deactivate()` has been replaced with `MediumEditor.destroy()`

#### `.createEvent()`
* `MediumEditor.createEvent()` is no longer needed in order to fire custom events. It has been removed.

#### `.hideToolbarDefaultActions()`
* `MediumEditor.hideToolbarDefaultActions()` has been removed.  Use the `hideToolbarDefaultActions()` method of the toolbar extension instead.

#### `.setToolbarPosition()`
* `MediumEditor.setToolbarPosition()` has been removed.  Use the `setToolbarPosition()` method of the toolbar extension instead.

#### `.callExtensions()`
* `MediumEditor.callExtensions()` has been removed and is no longer supported.


## MediumEditor Utility Methods

### MediumEditor.util
* `MediumEditor.util.getSelectionRange()` has been moved to `MediumEditor.selection.getSelectionRange()`
* `MediumEditor.util.getSelectionStart()` has been moved to `MediumEditor.selection.getSelectionStart()`
* `MediumEditor.util.unwrapElement()` has been removed. Use `MediumEditor.util.unwrap()` instead
* `MediumEditor.util.getSelectionData()` has been removed
* `MediumEditor.util.setObject()` has been removed
* `MediumEditor.util.getObject()` has been removed
* `MediumEditor.util.derives()` has been removed. Objects that can be drived from (like extensions and buttons) will have a `.extend()` method for extending.
* `MediumEditor.util.now()` has been removed.  Use `Date.now()` instead.
* `MediumEditor.util.parentElements` has been renamed `MediumEditor.util.blockContainerElementNames`

### MediumEditor.selection
* `MediumEditor.selection.getSelectionData()` has been removed


## MediumEditor CSS & Markup
* The `.clearfix` class has been removed, and `.clearfix` class is no longer added to the toolbar element.
* All references to `'medium'` in CSS classes has been replaced with `'medium-editor'`
  * Example: The image element added by the image dragging extension will now have a `medium-editor-image-loading` class on instead of `medium-image-loading`
* The `data-medium-element` attribute on all MediumEditor elements has been renamed to `data-medium-editor-element`
* Toolbar classes `sticky-toolbar` and `static-toolbar` have been renamed `medium-editor-sticky-toolbar` and `medium-editor-static-toolbar` respectively


## Other Changes

* The `getFocusedElement()` method of the toolbar extension has been removed. Use `MediumEditor.getFocusedElement()` instead.
* Keyboard Shortcuts are now controlled via the Keyboard Commands extension.  The `.key` option on buttons is not longer supported for mapping keyboard shortcuts.
