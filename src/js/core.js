/*global module, console, define, FileReader,
 Util, ButtonsData, DefaultButton,
 pasteHandler, Selection, AnchorExtension,
 Toolbar, AnchorPreview */

function MediumEditor(elements, options) {
    'use strict';
    return this.init(elements, options);
}

(function () {
    'use strict';

    MediumEditor.statics = {
        ButtonsData: ButtonsData,
        DefaultButton: DefaultButton,
        AnchorExtension: AnchorExtension,
        Toolbar: Toolbar
    };

    MediumEditor.prototype = {
        defaults: {
            allowMultiParagraphSelection: true,
            anchorInputPlaceholder: 'Paste or type a link',
            anchorInputCheckboxLabel: 'Open in new window',
            anchorPreviewHideDelay: 500,
            buttons: ['bold', 'italic', 'underline', 'anchor', 'header1', 'header2', 'quote'],
            buttonLabels: false,
            checkLinkFormat: false,
            cleanPastedHTML: false,
            delay: 0,
            diffLeft: 0,
            diffTop: -10,
            disableReturn: false,
            disableDoubleReturn: false,
            disableToolbar: false,
            disableEditing: false,
            disablePlaceholders: false,
            toolbarAlign: 'center',
            elementsContainer: false,
            imageDragging: true,
            standardizeSelectionStart: false,
            contentWindow: window,
            ownerDocument: document,
            firstHeader: 'h3',
            forcePlainText: true,
            placeholder: 'Type your text',
            secondHeader: 'h4',
            targetBlank: false,
            anchorTarget: false,
            anchorButton: false,
            anchorButtonClass: 'btn',
            extensions: {},
            activeButtonClass: 'medium-editor-button-active',
            firstButtonClass: 'medium-editor-button-first',
            lastButtonClass: 'medium-editor-button-last'
        },

        init: function (elements, options) {
            var uniqueId = 1;

            this.options = Util.defaults(options, this.defaults);
            this.setElementSelection(elements);
            if (this.elements.length === 0) {
                return;
            }

            if (!this.options.elementsContainer) {
                this.options.elementsContainer = this.options.ownerDocument.body;
            }

            while (this.options.elementsContainer.querySelector('#medium-editor-toolbar-' + uniqueId)) {
                uniqueId = uniqueId + 1;
            }

            this.id = uniqueId;

            return this.setup();
        },

        setup: function () {
            this.events = [];
            this.isActive = true;
            this.initCommands()
                .initElements()
                .bindDragDrop()
                .bindPaste()
                .setPlaceholders()
                .bindElementActions()
                .bindBlur();
        },

        on: function (target, event, listener, useCapture) {
            target.addEventListener(event, listener, useCapture);
            this.events.push([target, event, listener, useCapture]);
        },

        off: function (target, event, listener, useCapture) {
            var index = this.indexOfListener(target, event, listener, useCapture),
                e;
            if (index !== -1) {
                e = this.events.splice(index, 1)[0];
                e[0].removeEventListener(e[1], e[2], e[3]);
            }
        },

        indexOfListener: function (target, event, listener, useCapture) {
            var i, n, item;
            for (i = 0, n = this.events.length; i < n; i = i + 1) {
                item = this.events[i];
                if (item[0] === target && item[1] === event && item[2] === listener && item[3] === useCapture) {
                    return i;
                }
            }
            return -1;
        },

        delay: function (fn) {
            var self = this;
            setTimeout(function () {
                if (self.isActive) {
                    fn();
                }
            }, this.options.delay);
        },

        removeAllEvents: function () {
            var e = this.events.pop();
            while (e) {
                e[0].removeEventListener(e[1], e[2], e[3]);
                e = this.events.pop();
            }
        },

        initElements: function () {
            var i,
                addToolbar = false;
            for (i = 0; i < this.elements.length; i += 1) {
                if (!this.options.disableEditing && !this.elements[i].getAttribute('data-disable-editing')) {
                    this.elements[i].setAttribute('contentEditable', true);
                }
                if (!this.elements[i].getAttribute('data-placeholder')) {
                    this.elements[i].setAttribute('data-placeholder', this.options.placeholder);
                }
                this.elements[i].setAttribute('data-medium-element', true);
                this.elements[i].setAttribute('role', 'textbox');
                this.elements[i].setAttribute('aria-multiline', true);
                this.bindParagraphCreation(i);
                if (!this.options.disableToolbar && !this.elements[i].getAttribute('data-disable-toolbar')) {
                    addToolbar = true;
                }
            }
            // Init toolbar
            if (addToolbar) {
                this.initToolbar()
                    .bindAnchorPreview();
            }
            return this;
        },

        setElementSelection: function (selector) {
            if (!selector) {
                selector = [];
            }
            // If string, use as query selector
            if (typeof selector === 'string') {
                selector = this.options.ownerDocument.querySelectorAll(selector);
            }
            // If element, put into array
            if (Util.isElement(selector)) {
                selector = [selector];
            }
            // Convert NodeList (or other array like object) into an array
            this.elements = Array.prototype.slice.apply(selector);
        },

        bindBlur: function () {
            var self = this,
                blurFunction = function (e) {
                    var isDescendantOfEditorElements = false,
                        selection = self.options.contentWindow.getSelection(),
                        toolbarEl = (self.toolbar) ? self.toolbar.getToolbarElement() : null,
                        selRange = selection.isCollapsed ?
                                   null :
                                   Selection.getSelectedParentElement(selection.getRangeAt(0)),
                        i;

                    // This control was introduced also to avoid the toolbar
                    // to disapper when selecting from right to left and
                    // the selection ends at the beginning of the text.
                    for (i = 0; i < self.elements.length; i += 1) {
                        if (self.elements[i] === e.target
                                || Util.isDescendant(self.elements[i], e.target)
                                || Util.isDescendant(self.elements[i], selRange)) {
                            isDescendantOfEditorElements = true;
                            break;
                        }
                    }
                    // If it's not part of the editor, toolbar, or anchor preview
                    if (!isDescendantOfEditorElements
                            && (!toolbarEl || (toolbarEl !== e.target && !Util.isDescendant(toolbarEl, e.target)))
                            && self.anchorPreview !== e.target
                            && !Util.isDescendant(self.anchorPreview, e.target)) {

                        // Activate the placeholder
                        if (!self.options.disablePlaceholders) {
                            self.placeholderWrapper(e, self.elements[0]);
                        }

                        // Let the toolbar know that we've detected a blur
                        if (self.toolbar) {
                            self.toolbar.handleBlur(e);
                        }
                    }
                };

            // Hide the toolbar when focusing outside of the editor.
            this.on(this.options.ownerDocument.body, 'click', blurFunction, true);
            this.on(this.options.ownerDocument.body, 'focus', blurFunction, true);

            return this;
        },

        bindClick: function (i) {
            if (!this.options.disablePlaceholders) {
                this.on(this.elements[i], 'click', function () {
                    // Remove placeholder
                    this.classList.remove('medium-editor-placeholder');
                });
            }

            return this;
        },

        /**
         * This handles blur and keypress events on elements
         * Including Placeholders, and tooldbar hiding on blur
         */
        bindElementActions: function () {
            var i;

            for (i = 0; i < this.elements.length; i += 1) {

                if (!this.options.disablePlaceholders) {
                    // Active all of the placeholders
                    this.activatePlaceholder(this.elements[i]);
                }

                // Bind the return and tab keypress events
                this.bindReturn(i)
                    .bindKeydown(i)
                    .bindClick(i);
            }

            return this;
        },

        // Two functions to handle placeholders
        activatePlaceholder:  function (el) {
            if (!(el.querySelector('img')) &&
                    !(el.querySelector('blockquote')) &&
                    el.textContent.replace(/^\s+|\s+$/g, '') === '') {

                el.classList.add('medium-editor-placeholder');
            }
        },
        placeholderWrapper: function (evt, el) {
            el = el || evt.target;
            el.classList.remove('medium-editor-placeholder');
            if (evt.type !== 'keypress') {
                this.activatePlaceholder(el);
            }
        },

        serialize: function () {
            var i,
                elementid,
                content = {};
            for (i = 0; i < this.elements.length; i += 1) {
                elementid = (this.elements[i].id !== '') ? this.elements[i].id : 'element-' + i;
                content[elementid] = {
                    value: this.elements[i].innerHTML.trim()
                };
            }
            return content;
        },

        initExtension: function (extension, name) {
            if (extension.parent) {
                extension.base = this;
            }
            if (typeof extension.init === 'function') {
                extension.init(this);
            }
            if (!extension.name) {
                extension.name = name;
            }
            return extension;
        },

        initCommands: function () {
            var buttons = this.options.buttons,
                extensions = this.options.extensions,
                ext,
                name;
            this.commands = [];

            buttons.forEach(function (buttonName) {
                if (extensions[buttonName]) {
                    ext = this.initExtension(extensions[buttonName], buttonName);
                    this.commands.push(ext);
                } else if (buttonName === 'anchor') {
                    ext = this.initExtension(new AnchorExtension(), buttonName);
                    this.commands.push(ext);
                } else if (ButtonsData.hasOwnProperty(buttonName)) {
                    ext = new DefaultButton(ButtonsData[buttonName], this);
                    this.commands.push(ext);
                }
            }.bind(this));

            for (name in extensions) {
                if (extensions.hasOwnProperty(name) && buttons.indexOf(name) === -1) {
                    ext = this.initExtension(extensions[name], name);
                }
            }

            return this;
        },

        getExtensionByName: function (name) {
            var extension;
            if (this.commands && this.commands.length) {
                this.commands.forEach(function (ext) {
                    if (ext.name === name) {
                        extension = ext;
                    }
                });
            }
            return extension;
        },

        /**
         * Helper function to call a method with a number of parameters on all registered extensions.
         * The function assures that the function exists before calling.
         *
         * @param {string} funcName name of the function to call
         * @param [args] arguments passed into funcName
         */
        callExtensions: function (funcName) {
            if (arguments.length < 1) {
                return;
            }

            var args = Array.prototype.slice.call(arguments, 1),
                ext,
                name;

            for (name in this.options.extensions) {
                if (this.options.extensions.hasOwnProperty(name)) {
                    ext = this.options.extensions[name];
                    if (ext[funcName] !== undefined) {
                        ext[funcName].apply(ext, args);
                    }
                }
            }
            return this;
        },

        bindParagraphCreation: function (index) {
            var self = this;
            this.on(this.elements[index], 'keypress', function (e) {
                var node,
                    tagName;
                if (e.which === Util.keyCode.SPACE) {
                    node = Selection.getSelectionStart(self.options.ownerDocument);
                    tagName = node.tagName.toLowerCase();
                    if (tagName === 'a') {
                        self.options.ownerDocument.execCommand('unlink', false, null);
                    }
                }
            });

            this.on(this.elements[index], 'keyup', function (e) {
                var node = Selection.getSelectionStart(self.options.ownerDocument),
                    tagName,
                    editorElement;

                if (node
                        && node.getAttribute('data-medium-element')
                        && node.children.length === 0
                        && !(self.options.disableReturn || node.getAttribute('data-disable-return'))) {
                    self.options.ownerDocument.execCommand('formatBlock', false, 'p');
                }
                if (e.which === Util.keyCode.ENTER) {
                    node = Selection.getSelectionStart(self.options.ownerDocument);
                    tagName = node.tagName.toLowerCase();
                    editorElement = Selection.getSelectionElement(self.options.contentWindow);

                    if (!(self.options.disableReturn || editorElement.getAttribute('data-disable-return')) &&
                            tagName !== 'li' && !Util.isListItemChild(node)) {
                        // For anchor tags, unlink
                        if (tagName === 'a') {
                            self.options.ownerDocument.execCommand('unlink', false, null);
                        } else if (!e.shiftKey) {
                            // only format block if this is not a header tag
                            if (!/h\d/.test(tagName)) {
                                self.options.ownerDocument.execCommand('formatBlock', false, 'p');
                            }
                        }
                    }
                }
            });
            return this;
        },

        bindReturn: function (index) {
            var self = this;
            this.on(this.elements[index], 'keypress', function (e) {
                if (e.which === Util.keyCode.ENTER) {
                    if (self.options.disableReturn || this.getAttribute('data-disable-return')) {
                        e.preventDefault();
                    } else if (self.options.disableDoubleReturn || this.getAttribute('data-disable-double-return')) {
                        var node = Selection.getSelectionStart(self.options.contentWindow);
                        if (node && node.textContent.trim() === '') {
                            e.preventDefault();
                        }
                    }
                }
            });
            return this;
        },

        bindKeydown: function (index) {
            var self = this;
            this.on(this.elements[index], 'keydown', function (e) {
                var node, tag, key;

                if (e.which === Util.keyCode.TAB) {
                    // Override tab only for pre nodes
                    node = Selection.getSelectionStart(self.options.ownerDocument);
                    tag = node && node.tagName.toLowerCase();

                    if (tag === 'pre') {
                        e.preventDefault();
                        Util.insertHTMLCommand(self.options.ownerDocument, '    ');
                    }

                    // Tab to indent list structures!
                    if (tag === 'li' || Util.isListItemChild(node)) {
                        e.preventDefault();

                        // If Shift is down, outdent, otherwise indent
                        if (e.shiftKey) {
                            self.options.ownerDocument.execCommand('outdent', false, null);
                        } else {
                            self.options.ownerDocument.execCommand('indent', false, null);
                        }
                    }
                } else if (e.which === Util.keyCode.BACKSPACE || e.which === Util.keyCode.DELETE || e.which === Util.keyCode.ENTER) {

                    // Bind keys which can create or destroy a block element: backspace, delete, return
                    self.onBlockModifier(e);

                } else if (e.ctrlKey || e.metaKey) {
                    key = String.fromCharCode(e.which || e.keyCode).toLowerCase();
                    self.commands.forEach(function (extension) {
                        if (extension.options.key && extension.options.key === key) {
                            extension.handleClick(e);
                        }
                    });
                }
            });
            return this;
        },

        onBlockModifier: function (e) {
            var range, sel, p, node = Selection.getSelectionStart(this.options.ownerDocument),
                tagName = node.tagName.toLowerCase(),
                isEmpty = /^(\s+|<br\/?>)?$/i,
                isHeader = /h\d/i;

            if ((e.which === Util.keyCode.BACKSPACE || e.which === Util.keyCode.ENTER)
                    && node.previousElementSibling
                    // in a header
                    && isHeader.test(tagName)
                    // at the very end of the block
                    && Selection.getCaretOffsets(node).left === 0) {
                if (e.which === Util.keyCode.BACKSPACE && isEmpty.test(node.previousElementSibling.innerHTML)) {
                    // backspacing the begining of a header into an empty previous element will
                    // change the tagName of the current node to prevent one
                    // instead delete previous node and cancel the event.
                    node.previousElementSibling.parentNode.removeChild(node.previousElementSibling);
                    e.preventDefault();
                } else if (e.which === Util.keyCode.ENTER) {
                    // hitting return in the begining of a header will create empty header elements before the current one
                    // instead, make "<p><br></p>" element, which are what happens if you hit return in an empty paragraph
                    p = this.options.ownerDocument.createElement('p');
                    p.innerHTML = '<br>';
                    node.previousElementSibling.parentNode.insertBefore(p, node);
                    e.preventDefault();
                }
            } else if (e.which === Util.keyCode.DELETE
                        && node.nextElementSibling
                        && node.previousElementSibling
                        // not in a header
                        && !isHeader.test(tagName)
                        // in an empty tag
                        && isEmpty.test(node.innerHTML)
                        // when the next tag *is* a header
                        && isHeader.test(node.nextElementSibling.tagName)) {
                // hitting delete in an empty element preceding a header, ex:
                //  <p>[CURSOR]</p><h1>Header</h1>
                // Will cause the h1 to become a paragraph.
                // Instead, delete the paragraph node and move the cursor to the begining of the h1

                // remove node and move cursor to start of header
                range = document.createRange();
                sel = this.options.contentWindow.getSelection();

                range.setStart(node.nextElementSibling, 0);
                range.collapse(true);

                sel.removeAllRanges();
                sel.addRange(range);

                node.previousElementSibling.parentNode.removeChild(node);

                e.preventDefault();
            }
        },

        initToolbar: function () {
            if (this.toolbar) {
                return this;
            }
            this.toolbar = new Toolbar(this);
            this.options.elementsContainer.appendChild(this.toolbar.getToolbarElement());
            this.anchorPreviewObj = new AnchorPreview();
            this.anchorPreviewObj.init(this);
            this.anchorPreview = this.anchorPreviewObj.anchorPreview;

            return this;
        },

        bindDragDrop: function () {
            var self = this, i, className, onDrag, onDrop, element;

            if (!self.options.imageDragging) {
                return this;
            }

            className = 'medium-editor-dragover';

            onDrag = function (e) {
                e.preventDefault();
                e.dataTransfer.dropEffect = "copy";

                if (e.type === "dragover") {
                    this.classList.add(className);
                } else {
                    this.classList.remove(className);
                }
            };

            onDrop = function (e) {
                var files;
                e.preventDefault();
                e.stopPropagation();
                // IE9 does not support the File API, so prevent file from opening in a new window
                // but also don't try to actually get the file
                if (e.dataTransfer.files) {
                    files = Array.prototype.slice.call(e.dataTransfer.files, 0);
                    files.some(function (file) {
                        if (file.type.match("image")) {
                            var fileReader, id;
                            fileReader = new FileReader();
                            fileReader.readAsDataURL(file);

                            id = 'medium-img-' + (+new Date());
                            Util.insertHTMLCommand(self.options.ownerDocument, '<img class="medium-image-loading" id="' + id + '" />');

                            fileReader.onload = function () {
                                var img = document.getElementById(id);
                                if (img) {
                                    img.removeAttribute('id');
                                    img.removeAttribute('class');
                                    img.src = fileReader.result;
                                }
                            };
                        }
                    });
                }
                this.classList.remove(className);
            };

            for (i = 0; i < this.elements.length; i += 1) {
                element = this.elements[i];

                this.on(element, 'dragover', onDrag);
                this.on(element, 'dragleave', onDrag);
                this.on(element, 'drop', onDrop);
            }
            return this;
        },

        stopSelectionUpdates: function () {
            this.preventSelectionUpdates = true;
        },

        startSelectionUpdates: function () {
            this.preventSelectionUpdates = false;
        },

        checkSelection: function () {
            if (this.toolbar) {
                this.toolbar.checkState();
            }
            return this;
        },

        // Wrapper around document.queryCommandState for checking whether an action has already
        // been applied to the current selection
        queryCommandState: function (action) {
            var fullAction = /^full-(.+)$/gi,
                match,
                queryState = null;

            // Actions starting with 'full-' need to be modified since this is a medium-editor concept
            match = fullAction.exec(action);
            if (match) {
                action = match[1];
            }

            try {
                queryState = this.options.ownerDocument.queryCommandState(action);
            } catch (exc) {
                queryState = null;
            }

            return queryState;
        },

        execAction: function (action, opts) {
            /*jslint regexp: true*/
            var fullAction = /^full-(.+)$/gi,
                match,
                result;
            /*jslint regexp: false*/

            // Actions starting with 'full-' should be applied to to the entire contents of the editable element
            // (ie full-bold, full-append-pre, etc.)
            match = fullAction.exec(action);
            if (match) {
                // Store the current selection to be restored after applying the action
                this.saveSelection();
                // Select all of the contents before calling the action
                this.selectAllContents();
                result = this.execActionInternal(match[1], opts);
                // Restore the previous selection
                this.restoreSelection();
            } else {
                result = this.execActionInternal(action, opts);
            }

            this.checkSelection();
            return result;
        },

        execActionInternal: function (action, opts) {
            /*jslint regexp: true*/
            var appendAction = /^append-(.+)$/gi,
                match;
            /*jslint regexp: false*/

            // Actions starting with 'append-' should attempt to format a block of text ('formatBlock') using a specific
            // type of block element (ie append-blockquote, append-h1, append-pre, etc.)
            match = appendAction.exec(action);
            if (match) {
                return this.execFormatBlock(match[1]);
            }

            if (action === 'createLink') {
                return this.createLink(opts);
            }

            if (action === 'image') {
                return this.options.ownerDocument.execCommand('insertImage', false, this.options.contentWindow.getSelection());
            }

            return this.options.ownerDocument.execCommand(action, false, null);
        },

        getSelectedParentElement: function (range) {
            if (range === undefined) {
                range = this.options.contentWindow.getSelection().getRangeAt(0);
            }
            return Selection.getSelectedParentElement(range);
        },

        execFormatBlock: function (el) {
            var selectionData = Selection.getSelectionData(this.selection.anchorNode);
            // FF handles blockquote differently on formatBlock
            // allowing nesting, we need to use outdent
            // https://developer.mozilla.org/en-US/docs/Rich-Text_Editing_in_Mozilla
            if (el === 'blockquote' && selectionData.el &&
                    selectionData.el.parentNode.tagName.toLowerCase() === 'blockquote') {
                return this.options.ownerDocument.execCommand('outdent', false, null);
            }
            if (selectionData.tagName === el) {
                el = 'p';
            }
            // When IE we need to add <> to heading elements and
            //  blockquote needs to be called as indent
            // http://stackoverflow.com/questions/10741831/execcommand-formatblock-headings-in-ie
            // http://stackoverflow.com/questions/1816223/rich-text-editor-with-blockquote-function/1821777#1821777
            if (Util.isIE) {
                if (el === 'blockquote') {
                    return this.options.ownerDocument.execCommand('indent', false, el);
                }
                el = '<' + el + '>';
            }
            return this.options.ownerDocument.execCommand('formatBlock', false, el);
        },

        hideToolbarDefaultActions: function () {
            if (this.toolbar) {
                this.toolbar.hideToolbarDefaultActions();
            }
            return this;
        },

        setToolbarPosition: function () {
            if (this.toolbar) {
                this.toolbar.setToolbarPosition();
            }
        },

        selectAllContents: function () {
            var range = this.options.ownerDocument.createRange(),
                sel = this.options.contentWindow.getSelection(),
                currNode = Selection.getSelectionElement(this.options.contentWindow);

            if (currNode) {
                // Move to the lowest descendant node that still selects all of the contents
                while (currNode.children.length === 1) {
                    currNode = currNode.children[0];
                }

                range.selectNodeContents(currNode);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        },

        // http://stackoverflow.com/questions/17678843/cant-restore-selection-after-html-modify-even-if-its-the-same-html
        // Tim Down
        // TODO: move to selection.js and clean up old methods there
        saveSelection: function () {
            this.selectionState = null;

            var selection = this.options.contentWindow.getSelection(),
                range,
                preSelectionRange,
                start,
                editableElementIndex = -1;

            if (selection.rangeCount > 0) {
                range = selection.getRangeAt(0);
                preSelectionRange = range.cloneRange();

                // Find element current selection is inside
                this.elements.forEach(function (el, index) {
                    if (el === range.startContainer || Util.isDescendant(el, range.startContainer)) {
                        editableElementIndex = index;
                        return false;
                    }
                });

                if (editableElementIndex > -1) {
                    preSelectionRange.selectNodeContents(this.elements[editableElementIndex]);
                    preSelectionRange.setEnd(range.startContainer, range.startOffset);
                    start = preSelectionRange.toString().length;

                    this.selectionState = {
                        start: start,
                        end: start + range.toString().length,
                        editableElementIndex: editableElementIndex
                    };
                }
            }
        },

        // http://stackoverflow.com/questions/17678843/cant-restore-selection-after-html-modify-even-if-its-the-same-html
        // Tim Down
        // TODO: move to selection.js and clean up old methods there
        restoreSelection: function () {
            if (!this.selectionState) {
                return;
            }

            var editableElement = this.elements[this.selectionState.editableElementIndex],
                charIndex = 0,
                range = this.options.ownerDocument.createRange(),
                nodeStack = [editableElement],
                node,
                foundStart = false,
                stop = false,
                i,
                sel,
                nextCharIndex;

            range.setStart(editableElement, 0);
            range.collapse(true);

            node = nodeStack.pop();
            while (!stop && node) {
                if (node.nodeType === 3) {
                    nextCharIndex = charIndex + node.length;
                    if (!foundStart && this.selectionState.start >= charIndex && this.selectionState.start <= nextCharIndex) {
                        range.setStart(node, this.selectionState.start - charIndex);
                        foundStart = true;
                    }
                    if (foundStart && this.selectionState.end >= charIndex && this.selectionState.end <= nextCharIndex) {
                        range.setEnd(node, this.selectionState.end - charIndex);
                        stop = true;
                    }
                    charIndex = nextCharIndex;
                } else {
                    i = node.childNodes.length - 1;
                    while (i >= 0) {
                        nodeStack.push(node.childNodes[i]);
                        i -= 1;
                    }
                }
                if (!stop) {
                    node = nodeStack.pop();
                }
            }

            sel = this.options.contentWindow.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        },

        hideAnchorPreview: function () {
            this.anchorPreview.classList.remove('medium-editor-anchor-preview-active');
        },

        // TODO: break method
        showAnchorPreview: function (anchorEl) {
            if (this.anchorPreview.classList.contains('medium-editor-anchor-preview-active')
                    || anchorEl.getAttribute('data-disable-preview')) {
                return true;
            }

            var self = this,
                buttonHeight = 40,
                boundary = anchorEl.getBoundingClientRect(),
                middleBoundary = (boundary.left + boundary.right) / 2,
                halfOffsetWidth,
                defaultLeft;

            self.anchorPreview.querySelector('i').textContent = anchorEl.attributes.href.value;
            halfOffsetWidth = self.anchorPreview.offsetWidth / 2;
            defaultLeft = self.options.diffLeft - halfOffsetWidth;

            self.observeAnchorPreview(anchorEl);

            self.anchorPreview.classList.add('medium-toolbar-arrow-over');
            self.anchorPreview.classList.remove('medium-toolbar-arrow-under');
            self.anchorPreview.style.top = Math.round(buttonHeight + boundary.bottom - self.options.diffTop + this.options.contentWindow.pageYOffset - self.anchorPreview.offsetHeight) + 'px';
            if (middleBoundary < halfOffsetWidth) {
                self.anchorPreview.style.left = defaultLeft + halfOffsetWidth + 'px';
            } else if ((this.options.contentWindow.innerWidth - middleBoundary) < halfOffsetWidth) {
                self.anchorPreview.style.left = this.options.contentWindow.innerWidth + defaultLeft - halfOffsetWidth + 'px';
            } else {
                self.anchorPreview.style.left = defaultLeft + middleBoundary + 'px';
            }

            if (this.anchorPreview && !this.anchorPreview.classList.contains('medium-editor-anchor-preview-active')) {
                this.anchorPreview.classList.add('medium-editor-anchor-preview-active');
            }

            return this;
        },

        // TODO: break method
        observeAnchorPreview: function (anchorEl) {
            var self = this,
                lastOver = (new Date()).getTime(),
                over = true,
                stamp = function () {
                    lastOver = (new Date()).getTime();
                    over = true;
                },
                unstamp = function (e) {
                    if (!e.relatedTarget || !/anchor-preview/.test(e.relatedTarget.className)) {
                        over = false;
                    }
                },
                interval_timer = setInterval(function () {
                    if (over) {
                        return true;
                    }
                    var durr = (new Date()).getTime() - lastOver;
                    if (durr > self.options.anchorPreviewHideDelay) {
                        // hide the preview 1/2 second after mouse leaves the link
                        self.hideAnchorPreview();

                        // cleanup
                        clearInterval(interval_timer);
                        self.off(self.anchorPreview, 'mouseover', stamp);
                        self.off(self.anchorPreview, 'mouseout', unstamp);
                        self.off(anchorEl, 'mouseover', stamp);
                        self.off(anchorEl, 'mouseout', unstamp);

                    }
                }, 200);

            this.on(self.anchorPreview, 'mouseover', stamp);
            this.on(self.anchorPreview, 'mouseout', unstamp);
            this.on(anchorEl, 'mouseover', stamp);
            this.on(anchorEl, 'mouseout', unstamp);
        },

        editorAnchorObserver: function (e) {
            var self = this,
                overAnchor = true,
                leaveAnchor = function () {
                    // mark the anchor as no longer hovered, and stop listening
                    overAnchor = false;
                    self.off(self.activeAnchor, 'mouseout', leaveAnchor);
                };

            if (e.target && e.target.tagName.toLowerCase() === 'a') {

                // Detect empty href attributes
                // The browser will make href="" or href="#top"
                // into absolute urls when accessed as e.targed.href, so check the html
                if (!/href=["']\S+["']/.test(e.target.outerHTML) || /href=["']#\S+["']/.test(e.target.outerHTML)) {
                    return true;
                }

                // only show when hovering on anchors
                if (this.toolbar && this.toolbar.isDisplayed()) {
                    // only show when toolbar is not present
                    return true;
                }
                this.activeAnchor = e.target;
                this.on(this.activeAnchor, 'mouseout', leaveAnchor);
                // Using setTimeout + options.delay because:
                // - We're going to show the anchor preview according to the configured delay
                //   if the mouse has not left the anchor tag in that time
                this.delay(function () {
                    if (overAnchor) {
                        self.showAnchorPreview(e.target);
                    }
                });
            }
        },

        bindAnchorPreview: function (index) {
            var i, self = this;
            this.editorAnchorObserverWrapper = function (e) {
                self.editorAnchorObserver(e);
            };
            for (i = 0; i < this.elements.length; i += 1) {
                this.on(this.elements[i], 'mouseover', this.editorAnchorObserverWrapper);
            }
            return this;
        },

        createLink: function (opts) {
            var customEvent,
                i;

            if (opts.url && opts.url.trim().length > 0) {
                this.options.ownerDocument.execCommand('createLink', false, opts.url);

                if (this.options.targetBlank || opts.target === '_blank') {
                    Util.setTargetBlank(Selection.getSelectionStart(this.options.ownerDocument));
                }

                if (opts.buttonClass) {
                    this.setButtonClass(opts.buttonClass);
                }
            }

            if (this.options.targetBlank || opts.target === "_blank" || opts.buttonClass) {
                customEvent = this.options.ownerDocument.createEvent("HTMLEvents");
                customEvent.initEvent("input", true, true, this.options.contentWindow);
                for (i = 0; i < this.elements.length; i += 1) {
                    this.elements[i].dispatchEvent(customEvent);
                }
            }
        },

        setButtonClass: function (buttonClass) {
            var el = Selection.getSelectionStart(this.options.ownerDocument),
                classes = buttonClass.split(' '),
                i,
                j;
            if (el.tagName.toLowerCase() === 'a') {
                for (j = 0; j < classes.length; j += 1) {
                    el.classList.add(classes[j]);
                }
            } else {
                el = el.getElementsByTagName('a');
                for (i = 0; i < el.length; i += 1) {
                    for (j = 0; j < classes.length; j += 1) {
                        el[i].classList.add(classes[j]);
                    }
                }
            }
        },

        activate: function () {
            if (this.isActive) {
                return;
            }

            this.setup();
        },

        // TODO: break method
        deactivate: function () {
            var i;
            if (!this.isActive) {
                return;
            }
            this.isActive = false;

            if (this.toolbar !== undefined) {
                this.toolbar.deactivate();
                delete this.toolbar;
            }
            if (this.anchorPreviewObj) {
                this.anchorPreviewObj.deactivate();
                delete this.anchorPreview;
                delete this.anchorPreviewObj;
            }

            for (i = 0; i < this.elements.length; i += 1) {
                this.elements[i].removeAttribute('contentEditable');
                this.elements[i].removeAttribute('data-medium-element');
            }

            this.commands.forEach(function (extension) {
                if (typeof extension.deactivate === 'function') {
                    extension.deactivate();
                }
            }.bind(this));

            this.removeAllEvents();
        },

        bindPaste: function () {
            var i, self = this;
            this.pasteWrapper = function (e) {
                pasteHandler.handlePaste(this, e, self.options);
            };
            for (i = 0; i < this.elements.length; i += 1) {
                this.on(this.elements[i], 'paste', this.pasteWrapper);
            }
            return this;
        },

        setPlaceholders: function () {
            if (!this.options.disablePlaceholders && this.elements && this.elements.length) {
                this.elements.forEach(function (el) {
                    this.activatePlaceholder(el);
                    this.on(el, 'blur', this.placeholderWrapper.bind(this));
                    this.on(el, 'keypress', this.placeholderWrapper.bind(this));
                }.bind(this));
            }

            return this;
        },

        cleanPaste: function (text) {
            pasteHandler.cleanPaste(text, this.options);
        },

        pasteHTML: function (html) {
            pasteHandler.pasteHTML(html, this.options.ownerDocument);
        }
    };

}());
