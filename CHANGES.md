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
