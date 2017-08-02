5.23.2 / 2017-08-02
==================
* Add noopener & noreferrer into targetBlank #1355
* Add undefined check and fallback in Paste extension #1346


5.23.1 / 2017-06-27
==================
* Remove src from bower ignored files #1330
* Add label-checkbox relation in CreateLink form #1275 #1340


5.23.0 / 2017-03-02
==================
* Only add schemes to URLs with hostnames #1258
* Fix problem with addClassToAnchors #1293
* Adding new 'html' button from #1235 #1291
* Don't encode fragment as part of linkValidation #1257


5.22.2 / 2017-01-19
==================
* Efficiency: Compile RegEx once #1230
* Error in console at link selection #1249
* Check for this.anchorPreview when hiding #1280
* Save some CPU calculations #1271


5.22.1 / 2016-09-29
==================
* Fix encoded urls (in linkValidaton) #1219
* Fix CommonJS environment #1221


5.22.0 / 2016-09-03
==================
* Add new extensions to extensions README #1188
* Fix iframe div #1179
* Fix placeholder text color in flat theme #1192
* Add unwrapTags option to paste extension #1177
* Remove first empty paragraph on backspace #1187
* Update grunt-contrib-jasmine #1185
* Added Embed Button links to README #1183


5.21.1 / 2016-08-11
==================
* Make linkValidation allow hash links #1143
* Fix toolbar in absolute container #1152
* Fix caret issue in blockquote #1162
* Handle new Google Docs font weights #1168
* Add external button example #1175


5.21.0 / 2016-06-21
==================
* Fix issue with electron environment #1125
* Fix for paste and placeholder extensions & add/remove element events #1124
* Placeholder is visible when only empty table is in Editor #1128


5.20.2 / 2016-06-17
==================
(5.20.1 was skipped because of a bad release)
* Fix test failure in Chrome 51 #1114
* Fix slow CSS selector #1115
* Improve documentation for toolbar.relativeContainer option #1122
* Fix cursor rendering incorrectly in Firefox #1113


5.20.0 / 2016-06-02
==================
* Fix anchor-preview bug where click preview no longer prefills href into anchor form
* Add getEditorFromElement for retrieving an editor instance from an editor element
* Respect form.reset for textarea elements within forms passed into the editor
* Add getContent + resetContent helpers for retrieving/reverting content of editors
* Add support for extensions preventing blur on editor when user interacts with extension elements


5.19.1 / 2016-05-28
==================
* Add feature for toggling anchor preview for empty or # links
* Fix keyboard paste to properly fire editablePaste
* Standardize editablePaste to always fire with mock event object


5.18.0 / 2016-05-21
==================
* Add support calling document.execCommand with arbitrary argument from execAction
  * Also deprecate custom execAction option names in favor of standard .value
* Fix error from addElements when initializing editor with no elements


5.17.0 / 2016-05-17
==================
* Improved paste handling
  * Includes proper support for keyboard paste in firefox
  * More cleanup when pasting from Word
* Introduce support for adding and removing elements from an existing editor instances
  * New addElements and removeElements methods
* Add checkContentChanged method for manually triggering editableInput
* Add selection.selectRange helper method


5.16.1 / 2016-04-14
==================
* Fix incorrect word breaking


5.16.0 / 2016-04-12
==================
* Add support for multiple targets for attaching/detach event handlers
* Add support for chaining calls to attach/detach events
* Fix issue with click anchor-preview when using showWhenToolbarIsVisible
* Fix IE issue with line-breaking within editor
* Fix Firefox error when using elements other than divs as editor


5.15.1 / 2016-04-05
==================
* Fix link validation in anchor extension
* Improve performance when dealing with a lot of data
* Enable functions to be used as keyboard commands


5.15.0 / 2016-03-23
==================
* Use class instead of inline style for hiding/showing anchor form
* Add helpers for hiding/showing form into form extension base class
* Fix issue where auto-link extension re-enabled IE's built-in auto-link when other instances still existed
* Fix anchor form to display form before attempting to position correctly
* Add new selection.clearSelection() helper method for moving cursor to beginning/end of selection


5.14.4 / 2016-02-25
==================
* editableInput event fixes
  * Fix issue with event not triggering when dragging in images
  * Fix issue with event not triggering on autolink
  * Fix issue with event not triggering on insertHTML in Edge
* Fix issue with hitting enter when directly inside figcaption and other block elements


5.14.3 / 2016-02-22
==================
* Fix behaviour of "Open in new window" checkbox for Firefox
* Added instruction to disable file dragging all together
* Fix issue with image dragging and dropping at end of target
* Fix issue with extra space when space already exists


5.14.2 / 2016-02-10
==================
* Support Microsoft Edge
  * Fallback to custom insertHTML command instead of built-in command for Edge
  * Use shim code for detecting input on contenteditable for Edge
  * Fix issue with converting blockquotes to paragraphs in Edge
  * Update documentation, fix tests, and include Edge in browser testing


5.14.1 / 2016-02-05
==================
* Fix issue with saving selection after newline and whitespace text nodes
* Fix import/export selection to prefer start of nodes over end of nodes
* Fix for getClosestBlockContainer utility function
* Fix for getTopBlockContainer utility function
* Deprecate getFirstTextNode utility function


5.14.0 / 2016-01-31
==================
* Added pre clean replacements
* Fixed an infinite loop
* Handled enter event for empty h2/h3 tag


5.13.0 / 2016-01-18
==================
* Added stickyTopOffset option to keep on the screen a sticky toolbar
* Fixed misplacement of buttons when selection is near to the right edge
* Updated dev dependencies
* Added reference to README for who is using medium-editor


5.12.0 / 2015-12-15
==================
* Fix issue with image-only selections
* Trim src when using the image toolbar button
* Fix auto linking with comments
* Documented the process of releasing a new version


5.11.0 / 2015-12-05
==================
* Updated table extension demo
* Removed the carriage return character from a demo file
* Updated checkLinkFormat function to support more schemes
* Fixed issue with disableExtraSpaces option to allow space at the end of line
* Use editableInput instead of input event for textarea syncing
* Fixed style for correct positioning of placeholder
* Allowed to remove blockquote by pressing delete at beginning of the quote
* Fixed failing test cases in IE9 and IE10


5.10.0 / 2015-10-30
==================
* Added disableExtraSpaces option for preventing errant spaces
* Added editalbeKeydownSpace event
* Fix issue with return key at the end of text with bad formatting
* Added new font name extension (beta)
* Documentation updates and cleanup


5.9.0 / 2015-10-19
==================
* Add showWhenToolbarIsVisible option for displaying anchor-preview when toolbar is visible
* Remove trailing whitespace when creating links via anchor extension
* Fix issue with escaping list items via pressing enter
* Fix font-awesome links in demo pages
* Updates to documentation around creating links


5.8.3 / 2015-10-08
==================
* Fix changing link on images


5.8.2 / 2015-09-21
==================
* Fix type of elements which can contain auto-links


5.8.1 / 2015-09-16
==================
* Fix inconsistancies and errors in isDescendant utility method


5.8.0 / 2015-09-13
==================
* Added relativeContainer options for the toolbar
* Fix issue with auto-linking across consecutive list-items
* Added beagle theme


5.7.0 / 2015-08-21
==================
* Fix backwards compatability issue with how keyboard commands extension handles 'alt'
* Rewrite which event placeholder extension listens to for hiding/showing placeholder
  * Fix issue where placeholder is not hidden when calling setContent()
  * Fix issue where placeholder is displayed incorrectly when hideOnClick option is true


5.6.3 / 2015-08-18
==================
* Ensure textarea ids are unique on entire page
* Fix broken auto-link within block elements other than paragraphs
* Fix issue with editor element being removed in IE11
* Remove references to global variables from internal code


5.6.2 / 2015-08-11
==================
* Fix a regression in the paste extension related to `pasteHTML` function


5.6.1 / 2015-08-10
==================
* Fix issue with creating anchors and restoring selection at the beginning of paragraphs
* Fix issue with creating anchors and restoring selection within list items and nested blocks
* Ensure CTRL + M is respected as a way to insert new lines


5.6.0 / 2015-08-07
==================
* Add new 'tim' theme for medium-editor toolbar
* Fix issue Chrome generated comment tags when pasting
* Fix issue where 'editableInput' is triggered multiple times when creating links


5.5.4 / 2015-08-04
==================
* Fix issue with anchor and selection inconsitencies in IE


5.5.3 / 2015-08-03
==================
* Fix issue with replacing a pre-existing link
* Fix issue with selection after creating a link after empty paragraphs


5.5.2 / 2015-08-02
==================
* Fix issue where block elements where cleaned up incorrectly when pasting
* Fix anchor form checkboxes to reflect status of selected link
* Fix issue with creating links in same paragraph as another link
* Fix issue with creating links after empty paragraphs
* Ensure all attributes are copied from textareas to divs


5.5.1 / 2015-07-23
==================
* Fix appearance of anchor form when checkboxes are present
* Fix breaking issue with standardizeSelectionStart option


5.5.0 / 2015-07-21
==================
* Add setContent method into core API, which triggers editableInput


5.4.1 / 2015-07-20
==================
* Fix issue where custom anchor-preview extensions weren't overriding built-in anchor preview
* Add documentation from wiki into the source code


5.4.0 / 2015-07-16
==================
* Add support for including 'alt' key in keyboard-commands


5.3.0 / 2015-07-07
==================
* Fix issue with disabling image drag & drop via imageDragging option
  * Deprecate image-dragging extension
  * Introduce file-dragging extension
* Ensure autolink urls respect targetBlank option
* Expose importSelection and exportSelection as generic Selection helpers


5.2.0 / 2015-06-29
==================
* Move allowMultiParagraphSelection into toolbar options
  * Deprecate global allowMultiParagraphSelection option
* Fix issue with allowMultiParagraphSelection option over empty elements
* Fix issue with creating links producing multiple anchor tags
* Fix issue where anchor preview displays while toolbar is visible
* Add demo pages for example extension and example button


5.1.0 / 2015-06-26
==================
* Add showToolbarDefaultAction helper method to form extension
* Ensure elements generated for textareas have a unique id
* Ensure all added attributes are removed during destroy
* Cleanup divs generated by Chrome during justify actions
* Add parameter to anchorPreview.positionPreview for reusability


5.0.0 / 2015-06-18
==================
* All deprecated functions have been removed
* Keyboard Shorcuts are now part of an extension and not attached to specific button/commands
* Placeholders are now part of an extension with its own dedicated options
* Toolbar is now an extension with its own dedicated options
* firstHeader and secondHeader are gone you should use h1 thru h6
* Support pre-releases
* Buttons
  * The array of buttons can now contain objects, for overriding any part of the button object
    * This replaces the custom object value for the buttonLabels option
* API
  * Unique id for MediumEditor instance will now remain unique (regardless of how many instances are created)
  * .statics references are gone
  * .trigger supports triggering events without needing to declare the event
  * .callExtensions(), .setToolbarPosition(), and .hideToolbarDefaultActions() have been removed
* Extension
  * .window & .document are now exposed as members of the Extension
  * init no longer is passed MediumEditor instance as first argument
* CSS
  * All classes are now `medium-editor` prefixed
* Util
  * getProp, derives, getSelectionData, setObject & getObject are gone
  * getSelectionRange & getSelectionStart are now in Selection


4.12.5 / 2015-06-16
==================
* Fix issue with restoring selection within nested block elements


4.12.4 / 2015-06-15
==================
* Ensure auto-link will never select an empty element (br, hr, input, etc.)


4.12.3 / 2015-06-12
==================
* Fix bug with un-linked auto-links causing unexpected cursor positioning


4.12.2 / 2015-06-10
==================
* Fix broken keyboard shortcuts


4.12.1 / 2015-06-02
==================
* Fix break with updateOnEmptySelection option for static toolbars


4.12.0 / 2015-06-01
==================
* Fix pasting links when targetBlank option is being used
* Fix for spellcheck option after destroy
* Fix over-reaching keyboard shortcuts for commands
* Expose new 'positionToolbar' custom event
* Add new isKey() helper in util
* Add cleanup on destroy for auto-link and placeholder extensions
* Base extension changes
  * Add getEditorElements(), getEditorId(), and getEditorOption() helpers
  * Add on(), off(), subscribe(), and execAction() helpers
  * Introduce destroy() lifecycle method + deprecate deactivate()


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
