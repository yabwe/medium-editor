/*global module, console, define, FileReader,
 Util, ButtonsData, DefaultButton,
 pasteHandler, Selection, AnchorExtension,
 Toolbar, AnchorPreview, Events, Placeholders */

function MediumEditor(elements, options) {
    'use strict';
    return this.init(elements, options);
}

(function () {
    'use strict';

    // Event handlers that shouldn't be exposed externally

    function handleDisabledEnterKeydown(event, element) {
        if (this.options.disableReturn || element.getAttribute('data-disable-return')) {
            event.preventDefault();
        } else if (this.options.disableDoubleReturn || this.getAttribute('data-disable-double-return')) {
            var node = Selection.getSelectionStart(this.options.contentWindow);
            if (node && node.textContent.trim() === '') {
                event.preventDefault();
            }
        }
    }

    function handleTabKeydown(event, element) {
        // Override tab only for pre nodes
        var node = Selection.getSelectionStart(this.options.ownerDocument),
            tag = node && node.tagName.toLowerCase();

        if (tag === 'pre') {
            event.preventDefault();
            Util.insertHTMLCommand(this.options.ownerDocument, '    ');
        }

        // Tab to indent list structures!
        if (tag === 'li' || Util.isListItemChild(node)) {
            event.preventDefault();

            // If Shift is down, outdent, otherwise indent
            if (event.shiftKey) {
                this.options.ownerDocument.execCommand('outdent', false, null);
            } else {
                this.options.ownerDocument.execCommand('indent', false, null);
            }
        }
    }

    MediumEditor.statics = {
        ButtonsData: ButtonsData,
        DefaultButton: DefaultButton,
        AnchorExtension: AnchorExtension,
        Toolbar: Toolbar,
        AnchorPreview: AnchorPreview
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
            disableAnchorPreview: false,
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
            this.events = new Events(this);
            this.isActive = true;
            this.initCommands()
                .initElements()
                .attachHandlers()
                .bindDragDrop()
                .bindPaste()
                .bindElementActions();

            if (!this.options.disablePlaceholders) {
                this.placeholders = new Placeholders(this);
            }
        },

        on: function (target, event, listener, useCapture) {
            this.events.attachDOMEvent(target, event, listener, useCapture);
        },

        off: function (target, event, listener, useCapture) {
            this.events.detachDOMEvent(target, event, listener, useCapture);
        },

        subscribe: function (event, listener) {
            this.events.attachCustomEvent(event, listener);
        },

        delay: function (fn) {
            var self = this;
            setTimeout(function () {
                if (self.isActive) {
                    fn();
                }
            }, this.options.delay);
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
                this.initToolbar();
            }
            return this;
        },

        attachHandlers: function () {
            var i;

            // attach to tabs
            this.subscribe('editableKeydownTab', handleTabKeydown.bind(this));

            // disabling return or double return
            if (this.options.disableReturn || this.options.disableDoubleReturn) {
                this.subscribe('editableKeydownEnter', handleDisabledEnterKeydown.bind(this));
            } else {
                for (i = 0; i < this.elements.length; i += 1) {
                    if (this.elements[i].getAttribute('data-disable-return') || this.elements[i].getAttribute('data-disable-double-return')) {
                        this.subscribe('editableKeydownEnter', handleDisabledEnterKeydown.bind(this));
                        break;
                    }
                }
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

        /**
         * This handles blur and keypress events on elements
         * Including Placeholders, and tooldbar hiding on blur
         */
        bindElementActions: function () {
            var i;

            for (i = 0; i < this.elements.length; i += 1) {
                // Bind the return and tab keypress events
                this.bindKeydown(i);
            }

            return this;
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

        shouldAddDefaultAnchorPreview: function () {
            var i,
                shouldAdd = false;

            // If anchor-preview is disabled, don't add
            if (this.options.disableAnchorPreview) {
                return false;
            }
            // If anchor-preview extension has been overriden, don't add
            if (this.options.extensions['anchor-preview']) {
                return false;
            }
            // If toolbar is disabled, don't add
            if (this.options.disableToolbar) {
                return false;
            }
            // If all elements have 'data-disable-toolbar' attribute, don't add
            for (i = 0; i < this.elements.length; i += 1) {
                if (!this.elements[i].getAttribute('data-disable-toolbar')) {
                    shouldAdd = true;
                }
            }

            return shouldAdd;
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

            // Add AnchorPreview as extension if needed
            if (this.shouldAddDefaultAnchorPreview()) {
                this.commands.push(this.initExtension(new AnchorPreview(), 'anchor-preview'));
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

        bindKeydown: function (index) {
            var self = this;
            this.on(this.elements[index], 'keydown', function (e) {
                if (e.which === Util.keyCode.BACKSPACE || e.which === Util.keyCode.DELETE || e.which === Util.keyCode.ENTER) {

                    // Bind keys which can create or destroy a block element: backspace, delete, return
                    self.onBlockModifier(e);

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

        createLink: function (opts) {
            var customEvent,
                i;

            if (opts.url && opts.url.trim().length > 0) {
                this.options.ownerDocument.execCommand('createLink', false, opts.url);

                if (this.options.targetBlank || opts.target === '_blank') {
                    Util.setTargetBlank(Selection.getSelectionStart(this.options.ownerDocument));
                }

                if (opts.buttonClass) {
                    Util.addClassToAnchors(Selection.getSelectionStart(this.options.ownerDocument), opts.buttonClass);
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

            for (i = 0; i < this.elements.length; i += 1) {
                this.elements[i].removeAttribute('contentEditable');
                this.elements[i].removeAttribute('data-medium-element');
            }

            this.commands.forEach(function (extension) {
                if (typeof extension.deactivate === 'function') {
                    extension.deactivate();
                }
            }.bind(this));

            this.events.detachAllDOMEvents();
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

        cleanPaste: function (text) {
            pasteHandler.cleanPaste(text, this.options);
        },

        pasteHTML: function (html) {
            pasteHandler.pasteHTML(html, this.options.ownerDocument);
        }
    };
}());
