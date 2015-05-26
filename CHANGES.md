4.11.1 / 2015-05-26
==================
* Fix issue with auto-linked text after manually unlinking
* Fix some incorrect TLDs for auto-link


4.11.0 / 2015-05-26
==================
* Add hideToolbar and showToolbar custom events
* Add hideOnClick option for placeholder extension
* Fix issue with linebreaks in Safari
* Fix issue with calling setup again after destroy
* Add support for CDN hosting
* Pass window and document to each extension
* Deprecate .parent property of extensions


4.10.2 / 2015-05-21
==================
* Auto-Link Fixes
  * Don't auto-link text after it is manually unlinked
  * Trigger auto-linking when focus is lost (ie Tab key)
  * Fix issue where link appears and immediately disappears when hitting Enter in IE11
  * Fix issue where hostname with more than three w's only auto-links final three w's in the name
  * Fix issue where valid urls were not auto-linked
  * Fix issue where some text was auto-linked when it shouldn't be


4.10.1 / 2015-05-20
==================
* Fix paste issue with plain-text containing multiple paragraphs
* Fix issue with incorrect cursor positon after creating a list
* Fix disabledDoubleReturn option within a sentence
* Allow for nested contenteditables
* New style of passing options for anchor-preview and anchor
* Introduce extensions.button + extensions.form as extendable base extensions
* Convert anchor, fontsize, and anchor-preview to updated extensions model


4.9.0 / 2015-05-18
==================
* New auto-link support for detecting urls and converting them to links
* Fix target _blank issue for links in Firefox
* Don't show placeholders for empty lists
* Allow for overriding image drag and drop via extension


4.8.1 / 2015-05-13
==================
* Fix error thrown when loading MediumEditor js from head


4.8.0 / 2015-05-11
==================
* Expose new 'editableInput' event for monitoring changes to editor
* Cleanup contenteditable elements created for textareas


4.7.3 / 2015-05-07
==================
* Update version number in dist files


4.7.2 / 2015-05-06
==================
* Add shortcut to insert a link (ctrl/cmd + k)
* Fix `this.getAttribute is not a function` error


4.7.1 / 2015-04-30
==================
* Make anchor preview wrap for long links
* Fix issue when clean pasting spans with child nodes


4.7.0 / 2015-04-27
==================
* Expose importSelection + exportSelection helper methods
* Fix issue with initialization of MediumEditor using textarea
* Introduce jscs

4.6.0 / 2015-04-22
==================
* Add 'beta' version of fontSize button/form
* Add option for enabling/disabling spellcheck
* Add titles to toolbar buttons for tooltips
* Use actual anchor tag in anchor preview
* Fix anchor preview issue with tags nested inside anchors

* Speed up travis builds
* Convert paste handler into overrideable extension


4.5.2 / 2015-04-14
==================
* Fix blur event detection when clicking on elements that don't clear focus


4.5.1 / 2015-04-14
==================
* Fix broken 'paste.cleanPastedHtml' option and rename to 'paste.cleanPastedHTML'


4.5.0 / 2015-04-13
==================
* Expose 'unsubscribe' for custom events
* Detach custom events when editor is destroyed
* Fix fontawesome url in demo page


4.4.0 / 2015-04-11
==================
* Expose smart 'blur' and 'focus' events which account for toolbar interaction
* Expose selectElement method for selecting text and updating toolbar
* Fix always wrapping pasted text in a <p> tag


4.3.0 / 2015-04-10
==================
* Add override options for pasteHTML and cleanPaste
* Support overriding of scss theme variables
* Fix for justify button states in IE
* New helpers for manipulating nested objects
* Internal tooling prep for options and defaults


4.2.0 / 2015-04-05
==================
* Add textarea support


4.1.1 / 2015-04-01
==================
* Fix .version issue


4.1.0 / 2015-03-29
==================
* Expose Util and Selection methods externally via MediumEditor.util and MediumEditor.selection
* Expose MediumEditor.version for version info
* Add support for custom cleaning of attributes and tags for .pasteHTML
* Move from jslint to jshint


4.0.3 / 2015-03-27
==================
* Introduce 'removeFormat' button, for removing formatting from selection
* Fix issues with focus/blur when using standardizeSelectionStart option


4.0.2 / 2015-03-26
==================
* Fix bug causing toolbar to disappaer on click in safari (rollback fix from 4.0.1)
* Break up anchor form extension logic into more overrideable parts


4.0.1 / 2015-03-24
==================
* Fix issue with dragged in image sizes
* Fix issues with focus/blur when using standardizeSelectionStart option


4.0.0 / 2015-03-23
==================
* Introduced custom events (consumable externally)
* Reduce API surface area
  * Deprecated activate & deactivated. Exposed setup and destroy as replacements
  * Updated documentation to reflect API changes
* HTML standardization around list items
* Fixed throttling
* Added superscript & subscript css
* Added better paste cleaning for Microsoft Word
* Convert anchor preview into overrideable extension
* Added disableAnchorPreview option


3.0.9 / 2015-03-10
==================
* Extract toolbar
* Extract anchor preview


3.0.8 / 2015-02-27
==================
* MIT License
* Use code from selection.js which is duplicated in core.js
* Fix bug in paste handling + increase paste coverage


3.0.7 / 2015-02-26
==================
* Ensure static toolbar won't render outside window + minimize when toolbar overflows
* Fix flashing static-toolbar bug
* Fix bug with sticky-toolbar when scrolling past bottom of contenteditable
* Fix css declaration of linear-gradient
* Fix AMD "Uncaught TypeError: undefined is not a function" issue
* Account for 'full' actions when doing queryCommandState
* Fix bugs in modified queryCommandState calls


3.0.0 / 2015-02-23
==================
* Extract anchor form code from core code and convert into an extension
* Expose onShowToolbar and onHideToolbar as options
* Change button method names (now `setActive` and `setInactive`) to differentiate from core's `activate` and `deactivate`
* Simplify blur check selection
* Add Sauce Labs configuration to automate cross-browser testing
* Add IE9 polyfill to repo
* Let 'meta' key trigger shortcuts


2.4.6 / 2015-02-18
==================
* Add basic support to keyboard shortcuts


2.4.5 / 2015-02-17
==================
* Fix main file reference in npm package


2.4.3 / 2015-02-16
==================
* Introduce full content actions


2.4.2 / 2015-02-15
==================
* Fix disableDoubleReturn option


2.4.1 / 2015-02-15
==================
* Fix isListItemChild call


2.4.0 / 2015-02-15
==================
* Split source code into several files for better development flow
* Make saveSelection and restoreSelection more consistant cross browser
* Use document.queryCommandState for some button toolbar states
* Add selection storage
* Call extensions deactivate when deactivating the editor
* Turn Anchor button into an extension


2.3.0 / 2015-02-11
==================
* Fix various selection and positioning bugs
* Introduce commands as combination of buttons and extensions
* Update aria label so that setting secondHeader activates the toolbar
* Don't use styles for detecting underline + strikethrough
* Fix 'imageDragging: false' option
* Fix list item tab identation
* Add extension onHide command


2.2.0 / 2015-02-05
==================
* Fix bug in getSelectedParentElement + Fix tests in browsers
* Fall back to shimmed insertHTML in cases where firefox throws
  when calling insertHTML
* Prevent "Argument not optional" error
* Prevent infinite loop after findAdjacentTextNodeWithContent
* Remove cleanups from contenteditable false areas
* Firefox fix: Don't modify value of input before calling execCommand()
* Fix selection issue for clean pasted html test case in firefox
* Add image drag and drop support


2.1.3 / 2015-01-31
==================
* Fix issue with multiple elements with the same class
  on the same editor instance


2.1.2 / 2015-01-30
==================
* Specify default npm registry (`http://registry.npmjs.org`)


2.1.1 / 2015-01-30
==================
* Adds support for newlines in placeholder attribute
* Adds support and documentation for new toolbar extensions
* Adds support for changing 'open in new window' label text
* Fixes bug where `nodeValue` could unexpectedly be null
* A couple of fixes to make tests a bit more reliable when run in the browser


2.1.0 / 2015-01-27
==================

* Handles ESC key in link editor
* Standardizes usage of setTimeout for UX delays vs debouncing vs deferring
* Adds an optional onShowToolbar method
* Supports enabling/disabling checkSelection updates externally
* Standardizes where in the DOM a range begins
* Adds ARIA role information
* Fixes off() not removing any event listeners
* Misc minor bug fixes and improvements


2.0.0 / 2015-01-06
==================

* Adds static toolbar feature
* Now uses textContent instead of innerText
* Fixes plain text paste on IE
* Hides placeholder on mouse click
* Adds a 'collapse' option to 'selectElementContents' helper
* Allows toolbar button states to change when selection is collapsed
* In hideToolbarActions, calls an optional 'onHideToolbar' method
* Ensures that ul.id and anchor.id are unique
* Avoids grabbing selection on keypress for contenteditable except for spacebar
* Supports disabling anchorForm, avoiding unnecessary event handling and element creation
* Supports disabling placeholders, including not attaching event handlers when not needed
* Various minor bug fixes and improvements


1.9.13 / 2014-11-24
===================

* Adds a strikethrough option in buttonLabel
* Now uses `options.elementsContainer` to calculate ID
* Removes events during deactivate


1.9.10 / 2014-11-17
===================

* Adds custom doc and win functionality, now you can specify the editor container
* Minor bugfixes


1.9.8 / 2014-10-21
==================

* Fixes 'this' out of scope


1.9.7 / 2014-10-20
==================

* Adds justify buttons
* Fix #308 by passing clipboard content through self.htmlEntities before inserting
* Minor bug fixes


1.9.4 / 2014-09-16
==================

* Adds support for tab based indenting and outdenting of <ul> and <ol>
* Adds a save button to the anchor form
* Improves toolbar positioning
* Adds anchorButton and anchorButtonClass options


1.9.0 / 2014-08-08
==================

* Extensions
* Disables the toolbar when selecting within an element that has contenteditable="false"
* Fixes hidden placeholder content override


1.8.14 / 2014-06-11
===================

* Fixes bug where if you had an empty blockquote the placeholder would still be active
* Fixes bug that would create link without values
* Exposes save/restoreSelection()
* Allows customization of active/first/last button classes
* Adds a script to run app from the cli
* Adds protocols to checkLinkFormat regex


1.8.8 / 2014-05-08
==================

* Fixes unlink behavior on Firefox
* Fixes white space behavior at the end of anchors


1.8.6 / 2014-05-03
==================

* Adds non-minified CSS files to bower.json


1.8.5 / 2014-05-01
==================

* Changes to the element list or element selector now take effect on reactivation
* Changed innerHTML to textContent to prevent XSS through twisted href values
* Checks for data-disable-return on element on paste
* Adds disableEditing and elementsContainer options


1.8.0 / 2014-04-12
==================

* Removes anchor preview listeners on deactivate
* Implements clean paste
* Adds an option to validate links
* Adds a basic extensions support
* Misc minor fixes


1.7.5 / 2014-03-30
==================

* Fixes isActive toggling
* Removes anchor preview default value


1.7.3 / 2014-03-22
==================

* Fixes activate/deactivate behavior


1.7.2 / 2014-03-22
==================

* Removes DOM elements created by MediumEditor on deactivate


1.7.1 / 2014-03-22
==================

* Prevents new lines with shift+enter when disableReturn is set to true


1.7.0 / 2014-03-22
==================

* Removes compass dependency by using grunt with libsass
* Fixes subscript button markup
* Fixes anchor preview behavior for empty links and anchors
* Adds a new option to disable double returns


1.6.7 / 2014-03-13
==================

* Allows initialization with a single DOM node
* Adds indent and outdent buttons


1.6.5 / 2014-03-08
==================

* fixes some minor paste bugs
* adds a delay option for anchor toolbar
* fixes anchor toolbar initial positioning
* fixes heading and blockquote on IE


1.6.1 / 2014-03-04
==================

* fixes case where clicking anchor preview and then clicking into the anchorInput
  causes hideToolbarActions to be called
* fixes window resize when toolbar element is not created


1.6.0 / 2014-02-27
==================

* Reorganizes CSS files
* Removes unused method bindElementToolbarEvents
* Adds a preview toolbar for anchors
* Removes paste event binding on deactivate


1.5.4 / 2014-02-12
==================

* Fixes filenames for main in bower.json
* Removes window resize event listener on deactivate


1.5.3 / 2014-01-22
==================

* Adds bootstrap theme
* Adds image button that converts selected text into an image tag
* Removes normalize.css dependency


1.5.0 / 2014-01-16
==================

* Adds 3 new themes: Roman, Mani e Flat


1.4.5 / 2014-01-13
==================

* Adds ability to set custom labels on buttons
* Updates uglify
* Fixes bug where pressing enter on formatted list item would generate
  a new list instead of a new list item


1.4.0 / 2013-12-13
==================

* Adds new extra buttons: pre and strikethrough
* Fixes placeholder bug on paste
* Various code improvements
* Prevents returns using shift when disableReturn is set to true
* Improves CSS to avoid conflicts


1.3.5 / 2013-11-27
==================

* Fixes problem with text selection ending outside the container div
* Implements serialize method
* Adds a targetBlank option
* Fixes Firefox box-sizing declarations


1.3.1 / 2013-11-19
==================

* Fixes toolbar binding button issue with multi-editor mode


1.3.0 / 2013-11-18
==================

* Fixes data-disable-return not preventing paragraph creation
* Improves getSelectionElement() to work in any case
* Fixes multi element selection bug
* Fixes Issues #88 & #89
* Improves binding for multiple editor instance, checkSelection() is called only once per instance
* Improves allowMultiParagraphSelection filter by removing empty tags elements before counting
* Considers header tags has a paragraph too (same as medium)


1.2.2 / 2013-11-07
==================

* Removes blur event listener when disabling the toolbar
* Adds a light gradient opacity to the toolbar
* Fixes bug that would keep toolbar alive when moving out of the anchor input


1.2.1 / 2013-11-07
==================

* Fixes empty selectionNode.el bug
* Prevents toolbar opening when changing to selection elements
  with the toolbar disabled
* Adds a transition to the toolbar when moving across elements


1.2.0 / 2013-11-06
==================

* Fixes issue on deactivation without enabled toolbar
* Fixes checkSelection error when disableToolbar option is enabled
* Adds new option to disable multiple paragraph selection
* Prevents paragraph creation on paste when disableReturn is set to true


1.1.6 / 2013-10-24
==================

* Adds extra buttons: superscript, subscript, ordered list and unordered list


1.1.5 / 2013-10-23
==================

* Changes buttons blacklist to whitelist


1.1.4 / 2013-10-13
==================

* Exports MediumEditor as module
* Changes "Underline" button to display "U" instead of "S"


1.1.3 / 2013-10-08
==================

* Pasted text is now wrapped into P elements


1.1.2 / 2013-10-06
==================

* Changes the editor to use the formatBlock command to handle block elements
* Fixes placeholder for empty elements


1.1.1 / 2013-10-04
==================

* Normalizes styles and scripts
* Improves bower manifest


1.1.0 / 2013-10-03
==================

* Adds an option to disable the toolbar and maintain only the contenteditable behavior
* Adds an option to disable returns
* Adds an placeholder option for the contenteditable areas


1.0.3 / 2013-10-01
==================

* Fixes toolbar positioning on screen top


1.0.2 / 2013-09-24
==================

* Adds the possibility to pass an element list directly into initialization
* Fixes issue with initial positioning when some actions are disabled
* Don't rely on :last-child to style first/last element, as they may be hidden


1.0.1 / 2013-09-20
==================

* Changes demo texto to something more friendly
* Fixes shift+enter behavior


1.0.0 / 2013-08-26
==================

* Initial release
