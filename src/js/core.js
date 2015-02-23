/*global module, console, define, FileReader,
 mediumEditorUtil, ButtonsData, DefaultButton,
 pasteHandler, meSelection, AnchorExtension */

function MediumEditor(elements, options) {
    'use strict';
    return this.init(elements, options);
}

(function () {
    'use strict';

    MediumEditor.statics = {
        ButtonsData: ButtonsData,
        DefaultButton: DefaultButton,
        AnchorExtension: AnchorExtension
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

            this.options = mediumEditorUtil.defaults(options, this.defaults);
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
            this.initThrottledMethods()
                .initCommands()
                .initElements()
                .bindSelect()
                .bindDragDrop()
                .bindPaste()
                .setPlaceholders()
                .bindElementActions()
                .bindWindowActions();
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

        initThrottledMethods: function () {
            var self = this;

            // handleResize is throttled because:
            // - It will be called when the browser is resizing, which can fire many times very quickly
            // - For some event (like resize) a slight lag in UI responsiveness is OK and provides performance benefits
            this.handleResize = mediumEditorUtil.throttle(function () {
                if (self.isActive) {
                    self.positionToolbarIfShown();
                }
            });

            // handleBlur is throttled because:
            // - This method could be called many times due to the type of event handlers that are calling it
            // - We want a slight delay so that other events in the stack can run, some of which may
            //   prevent the toolbar from being hidden (via this.keepToolbarAlive).
            this.handleBlur = mediumEditorUtil.throttle(function () {
                if (self.isActive && !self.keepToolbarAlive) {
                    self.hideToolbarActions();
                }
            });

            return this;
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
                    .setFirstAndLastButtons()
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
            if (mediumEditorUtil.isElement(selector)) {
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
                        selRange = selection.isCollapsed ?
                                   null :
                                   meSelection.getSelectedParentElement(selection.getRangeAt(0)),
                        i;

                    // This control was introduced also to avoid the toolbar
                    // to disapper when selecting from right to left and
                    // the selection ends at the beginning of the text.
                    for (i = 0; i < self.elements.length; i += 1) {
                        if (mediumEditorUtil.isDescendant(self.elements[i], e.target)
                                || mediumEditorUtil.isDescendant(self.elements[i], selRange)) {
                            isDescendantOfEditorElements = true;
                            break;
                        }
                    }
                    // If it's not part of the editor, or the toolbar
                    if (e.target !== self.toolbar
                            && self.elements.indexOf(e.target) === -1
                            && !isDescendantOfEditorElements
                            && !mediumEditorUtil.isDescendant(self.toolbar, e.target)
                            && !mediumEditorUtil.isDescendant(self.anchorPreview, e.target)) {

                        // Activate the placeholder
                        if (!self.options.disablePlaceholders) {
                            self.placeholderWrapper(e, self.elements[0]);
                        }

                        // Hide the toolbar after a small delay so we can prevent this on toolbar click
                        self.handleBlur();
                    }
                };

            // Hide the toolbar when focusing outside of the editor.
            this.on(this.options.ownerDocument.body, 'click', blurFunction, true);
            this.on(this.options.ownerDocument.body, 'focus', blurFunction, true);

            return this;
        },

        bindClick: function (i) {
            var self = this;

            this.on(this.elements[i], 'click', function () {
                if (!self.options.disablePlaceholders) {
                    // Remove placeholder
                    this.classList.remove('medium-editor-placeholder');
                }

                if (self.options.staticToolbar) {
                    self.setToolbarPosition();
                }
            });

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
                if (e.which === mediumEditorUtil.keyCode.SPACE) {
                    node = meSelection.getSelectionStart(self.options.ownerDocument);
                    tagName = node.tagName.toLowerCase();
                    if (tagName === 'a') {
                        self.options.ownerDocument.execCommand('unlink', false, null);
                    }
                }
            });

            this.on(this.elements[index], 'keyup', function (e) {
                var node = meSelection.getSelectionStart(self.options.ownerDocument),
                    tagName,
                    editorElement;

                if (node && node.getAttribute('data-medium-element') && node.children.length === 0 && !(self.options.disableReturn || node.getAttribute('data-disable-return'))) {
                    self.options.ownerDocument.execCommand('formatBlock', false, 'p');
                }
                if (e.which === mediumEditorUtil.keyCode.ENTER) {
                    node = meSelection.getSelectionStart(self.options.ownerDocument);
                    tagName = node.tagName.toLowerCase();
                    editorElement = meSelection.getSelectionElement(self.options.contentWindow);

                    if (!(self.options.disableReturn || editorElement.getAttribute('data-disable-return')) &&
                            tagName !== 'li' && !mediumEditorUtil.isListItemChild(node)) {
                        if (!e.shiftKey) {

                            // paragraph creation should not be forced within a header tag
                            if (!/h\d/.test(tagName)) {
                                self.options.ownerDocument.execCommand('formatBlock', false, 'p');
                            }
                        }
                        if (tagName === 'a') {
                            self.options.ownerDocument.execCommand('unlink', false, null);
                        }
                    }
                }
            });
            return this;
        },

        bindReturn: function (index) {
            var self = this;
            this.on(this.elements[index], 'keypress', function (e) {
                if (e.which === mediumEditorUtil.keyCode.ENTER) {
                    if (self.options.disableReturn || this.getAttribute('data-disable-return')) {
                        e.preventDefault();
                    } else if (self.options.disableDoubleReturn || this.getAttribute('data-disable-double-return')) {
                        var node = meSelection.getSelectionStart(self.options.contentWindow);
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

                if (e.which === mediumEditorUtil.keyCode.TAB) {
                    // Override tab only for pre nodes
                    node = meSelection.getSelectionStart(self.options.ownerDocument);
                    tag = node && node.tagName.toLowerCase();

                    if (tag === 'pre') {
                        e.preventDefault();
                        self.options.ownerDocument.execCommand('insertHtml', null, '    ');
                    }

                    // Tab to indent list structures!
                    if (tag === 'li' || mediumEditorUtil.isListItemChild(node)) {
                        e.preventDefault();

                        // If Shift is down, outdent, otherwise indent
                        if (e.shiftKey) {
                            self.options.ownerDocument.execCommand('outdent', e);
                        } else {
                            self.options.ownerDocument.execCommand('indent', e);
                        }
                    }
                } else if (e.which === mediumEditorUtil.keyCode.BACKSPACE || e.which === mediumEditorUtil.keyCode.DELETE || e.which === mediumEditorUtil.keyCode.ENTER) {

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
            var range, sel, p, node = meSelection.getSelectionStart(this.options.ownerDocument),
                tagName = node.tagName.toLowerCase(),
                isEmpty = /^(\s+|<br\/?>)?$/i,
                isHeader = /h\d/i;

            if ((e.which === mediumEditorUtil.keyCode.BACKSPACE || e.which === mediumEditorUtil.keyCode.ENTER)
                    && node.previousElementSibling
                    // in a header
                    && isHeader.test(tagName)
                    // at the very end of the block
                    && meSelection.getCaretOffsets(node).left === 0) {
                if (e.which === mediumEditorUtil.keyCode.BACKSPACE && isEmpty.test(node.previousElementSibling.innerHTML)) {
                    // backspacing the begining of a header into an empty previous element will
                    // change the tagName of the current node to prevent one
                    // instead delete previous node and cancel the event.
                    node.previousElementSibling.parentNode.removeChild(node.previousElementSibling);
                    e.preventDefault();
                } else if (e.which === mediumEditorUtil.keyCode.ENTER) {
                    // hitting return in the begining of a header will create empty header elements before the current one
                    // instead, make "<p><br></p>" element, which are what happens if you hit return in an empty paragraph
                    p = this.options.ownerDocument.createElement('p');
                    p.innerHTML = '<br>';
                    node.previousElementSibling.parentNode.insertBefore(p, node);
                    e.preventDefault();
                }
            } else if (e.which === mediumEditorUtil.keyCode.DELETE
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
                sel = window.getSelection();

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
            this.toolbar = this.createToolbar();
            this.keepToolbarAlive = false;
            this.toolbarActions = this.toolbar.querySelector('.medium-editor-toolbar-actions');
            this.anchorPreview = this.createAnchorPreview();

            return this;
        },

        createToolbar: function () {
            var toolbar = this.options.ownerDocument.createElement('div');
            toolbar.id = 'medium-editor-toolbar-' + this.id;
            toolbar.className = 'medium-editor-toolbar';

            if (this.options.staticToolbar) {
                toolbar.className += " static-toolbar";
            } else {
                toolbar.className += " stalker-toolbar";
            }

            toolbar.appendChild(this.toolbarButtons());

            // Add any forms that extensions may have
            this.commands.forEach(function (extension) {
                if (extension.hasForm) {
                    toolbar.appendChild(extension.getForm());
                }
            });

            this.options.elementsContainer.appendChild(toolbar);
            return toolbar;
        },

        //TODO: actionTemplate
        toolbarButtons: function () {
            var ul = this.options.ownerDocument.createElement('ul'),
                li,
                btn;

            ul.id = 'medium-editor-toolbar-actions' + this.id;
            ul.className = 'medium-editor-toolbar-actions clearfix';

            this.commands.forEach(function (extension) {
                if (typeof extension.getButton === 'function') {
                    btn = extension.getButton(this);
                    li = this.options.ownerDocument.createElement('li');
                    if (mediumEditorUtil.isElement(btn)) {
                        li.appendChild(btn);
                    } else {
                        li.innerHTML = btn;
                    }
                    ul.appendChild(li);
                }
            }.bind(this));

            return ul;
        },

        bindSelect: function () {
            var i,
                blurHelper = function (event) {
                    // Do not close the toolbar when bluring the editable area and clicking into the anchor form
                    if (event &&
                            event.type &&
                            event.type.toLowerCase() === 'blur' &&
                            event.relatedTarget &&
                            mediumEditorUtil.isDescendant(this.toolbar, event.relatedTarget)) {
                        return false;
                    }
                    this.checkSelection();
                }.bind(this),
                timeoutHelper = function () {
                    setTimeout(function () {
                        this.checkSelection();
                    }.bind(this), 0);
                }.bind(this);

            this.on(this.options.ownerDocument.documentElement, 'mouseup', this.checkSelection.bind(this));

            for (i = 0; i < this.elements.length; i += 1) {
                this.on(this.elements[i], 'keyup', this.checkSelection.bind(this));
                this.on(this.elements[i], 'blur', blurHelper);
                this.on(this.elements[i], 'click', timeoutHelper);
            }

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
                files = Array.prototype.slice.call(e.dataTransfer.files, 0);
                files.some(function (file) {
                    if (file.type.match("image")) {
                        var fileReader, id;
                        fileReader = new FileReader();
                        fileReader.readAsDataURL(file);

                        id = 'medium-img-' + (+new Date());
                        mediumEditorUtil.insertHTMLCommand(self.options.ownerDocument, '<img class="medium-image-loading" id="' + id + '" />');

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
            var newSelection,
                selectionElement;

            if (!this.preventSelectionUpdates &&
                    this.keepToolbarAlive !== true &&
                    !this.options.disableToolbar) {

                newSelection = this.options.contentWindow.getSelection();
                if ((!this.options.updateOnEmptySelection && newSelection.toString().trim() === '') ||
                        (this.options.allowMultiParagraphSelection === false && this.multipleBlockElementsSelected()) ||
                        meSelection.selectionInContentEditableFalse(this.options.contentWindow)) {
                    if (!this.options.staticToolbar) {
                        this.hideToolbarActions();
                    } else {
                        this.showAndUpdateToolbar();
                    }

                } else {
                    selectionElement = meSelection.getSelectionElement(this.options.contentWindow);
                    if (!selectionElement || selectionElement.getAttribute('data-disable-toolbar')) {
                        if (!this.options.staticToolbar) {
                            this.hideToolbarActions();
                        }
                    } else {
                        this.checkSelectionElement(newSelection, selectionElement);
                    }
                }
            }
            return this;
        },

        // Checks for existance of multiple block elements in the current selection
        multipleBlockElementsSelected: function () {
            /*jslint regexp: true*/
            var selectionHtml = meSelection.getSelectionHtml.call(this).replace(/<[\S]+><\/[\S]+>/gim, ''),
                hasMultiParagraphs = selectionHtml.match(/<(p|h[1-6]|blockquote)[^>]*>/g);
            /*jslint regexp: false*/

            return !!hasMultiParagraphs && hasMultiParagraphs.length > 1;
        },

        checkSelectionElement: function (newSelection, selectionElement) {
            var i,
                adjacentNode,
                offset = 0,
                newRange;
            this.selection = newSelection;
            this.selectionRange = this.selection.getRangeAt(0);

            /*
            * In firefox, there are cases (ie doubleclick of a word) where the selectionRange start
            * will be at the very end of an element.  In other browsers, the selectionRange start
            * would instead be at the very beginning of an element that actually has content.
            * example:
            *   <span>foo</span><span>bar</span>
            *
            * If the text 'bar' is selected, most browsers will have the selectionRange start at the beginning
            * of the 'bar' span.  However, there are cases where firefox will have the selectionRange start
            * at the end of the 'foo' span.  The contenteditable behavior will be ok, but if there are any
            * properties on the 'bar' span, they won't be reflected accurately in the toolbar
            * (ie 'Bold' button wouldn't be active)
            *
            * So, for cases where the selectionRange start is at the end of an element/node, find the next
            * adjacent text node that actually has content in it, and move the selectionRange start there.
            */
            if (this.options.standardizeSelectionStart &&
                    this.selectionRange.startContainer.nodeValue &&
                    (this.selectionRange.startOffset === this.selectionRange.startContainer.nodeValue.length)) {
                adjacentNode = mediumEditorUtil.findAdjacentTextNodeWithContent(meSelection.getSelectionElement(this.options.contentWindow), this.selectionRange.startContainer, this.options.ownerDocument);
                if (adjacentNode) {
                    offset = 0;
                    while (adjacentNode.nodeValue.substr(offset, 1).trim().length === 0) {
                        offset = offset + 1;
                    }
                    newRange = this.options.ownerDocument.createRange();
                    newRange.setStart(adjacentNode, offset);
                    newRange.setEnd(this.selectionRange.endContainer, this.selectionRange.endOffset);
                    this.selection.removeAllRanges();
                    this.selection.addRange(newRange);
                    this.selectionRange = newRange;
                }
            }

            for (i = 0; i < this.elements.length; i += 1) {
                if (this.elements[i] === selectionElement) {
                    this.showAndUpdateToolbar();
                    return;
                }
            }

            if (!this.options.staticToolbar) {
                this.hideToolbarActions();
            }
        },

        showAndUpdateToolbar: function () {
            this.setToolbarButtonStates()
                .setToolbarPosition()
                .showToolbarDefaultActions();
        },

        setToolbarPosition: function () {
            // document.documentElement for IE 9
            var scrollTop = (this.options.ownerDocument.documentElement && this.options.ownerDocument.documentElement.scrollTop) || this.options.ownerDocument.body.scrollTop,
                container = this.elements[0],
                containerRect = container.getBoundingClientRect(),
                containerTop = containerRect.top + scrollTop,
                buttonHeight = 50,
                selection = this.options.contentWindow.getSelection(),
                range,
                boundary,
                middleBoundary,
                defaultLeft = (this.options.diffLeft) - (this.toolbar.offsetWidth / 2),
                halfOffsetWidth = this.toolbar.offsetWidth / 2,
                containerCenter = (containerRect.left + (containerRect.width / 2));

            if (this.options.staticToolbar) {
                this.showToolbar();

                if (this.options.stickyToolbar) {

                    // If it's beyond the height of the editor, position it at the bottom of the editor
                    if (scrollTop > (containerTop + this.elements[0].offsetHeight - this.toolbar.offsetHeight)) {
                        this.toolbar.style.top = (containerTop + this.elements[0].offsetHeight) + 'px';

                    // Stick the toolbar to the top of the window
                    } else if (scrollTop > (containerTop - this.toolbar.offsetHeight)) {
                        this.toolbar.classList.add('sticky-toolbar');
                        this.toolbar.style.top = "0px";
                    // Normal static toolbar position
                    } else {
                        this.toolbar.classList.remove('sticky-toolbar');
                        this.toolbar.style.top = containerTop - this.toolbar.offsetHeight + "px";
                    }

                } else {
                    this.toolbar.style.top = containerTop - this.toolbar.offsetHeight + "px";
                }

                if (this.options.toolbarAlign) {
                    if (this.options.toolbarAlign === 'left') {
                        this.toolbar.style.left = containerRect.left + "px";
                    } else if (this.options.toolbarAlign === 'center') {
                        this.toolbar.style.left = (containerCenter - halfOffsetWidth) + "px";
                    } else {
                        this.toolbar.style.left = (containerRect.right - this.toolbar.offsetWidth) + "px";
                    }
                } else {
                    this.toolbar.style.left = (containerCenter - halfOffsetWidth) + "px";
                }

                this.hideAnchorPreview();

            } else if (selection.focusNode !== null && !selection.isCollapsed) {
                this.showToolbar();

                range = selection.getRangeAt(0);
                boundary = range.getBoundingClientRect();
                middleBoundary = (boundary.left + boundary.right) / 2;

                if (boundary.top < buttonHeight) {
                    this.toolbar.classList.add('medium-toolbar-arrow-over');
                    this.toolbar.classList.remove('medium-toolbar-arrow-under');
                    this.toolbar.style.top = buttonHeight + boundary.bottom - this.options.diffTop + this.options.contentWindow.pageYOffset - this.toolbar.offsetHeight + 'px';
                } else {
                    this.toolbar.classList.add('medium-toolbar-arrow-under');
                    this.toolbar.classList.remove('medium-toolbar-arrow-over');
                    this.toolbar.style.top = boundary.top + this.options.diffTop + this.options.contentWindow.pageYOffset - this.toolbar.offsetHeight + 'px';
                }
                if (middleBoundary < halfOffsetWidth) {
                    this.toolbar.style.left = defaultLeft + halfOffsetWidth + 'px';
                } else if ((this.options.contentWindow.innerWidth - middleBoundary) < halfOffsetWidth) {
                    this.toolbar.style.left = this.options.contentWindow.innerWidth + defaultLeft - halfOffsetWidth + 'px';
                } else {
                    this.toolbar.style.left = defaultLeft + middleBoundary + 'px';
                }

                this.hideAnchorPreview();
            }

            return this;
        },

        setToolbarButtonStates: function () {
            this.commands.forEach(function (extension) {
                if (typeof extension.isActive === 'function') {
                    extension.setInactive();
                }
            }.bind(this));
            this.checkActiveButtons();
            return this;
        },

        checkActiveButtons: function () {
            var elements = Array.prototype.slice.call(this.elements),
                manualStateChecks = [],
                queryState = null,
                parentNode,
                checkExtension = function (extension) {
                    if (typeof extension.checkState === 'function') {
                        extension.checkState(parentNode);
                    } else if (typeof extension.isActive === 'function' &&
                               typeof extension.isAlreadyApplied === 'function') {
                        if (!extension.isActive() && extension.isAlreadyApplied(parentNode)) {
                            extension.setActive();
                        }
                    }
                };

            if (!this.selectionRange) {
                return;
            }
            parentNode = meSelection.getSelectedParentElement(this.selectionRange);

            // Loop through all commands
            this.commands.forEach(function (command) {
                // For those commands where we can use document.queryCommandState(), do so
                if (typeof command.queryCommandState === 'function') {
                    queryState = command.queryCommandState();
                    // If queryCommandState returns a valid value, we can trust the browser
                    // and don't need to do our manual checks
                    if (queryState !== null) {
                        if (queryState) {
                            command.setActive();
                        }
                        return;
                    }
                }
                // We can't use queryCommandState for this command, so add to manualStateChecks
                manualStateChecks.push(command);
            });

            // Climb up the DOM and do manual checks for whether a certain command is currently enabled for this node
            while (parentNode.tagName !== undefined && mediumEditorUtil.parentElements.indexOf(parentNode.tagName.toLowerCase) === -1) {
                manualStateChecks.forEach(checkExtension.bind(this));

                // we can abort the search upwards if we leave the contentEditable element
                if (elements.indexOf(parentNode) !== -1) {
                    break;
                }
                parentNode = parentNode.parentNode;
            }
        },

        setFirstAndLastButtons: function () {
            var buttons = this.toolbar.querySelectorAll('button');
            if (buttons.length > 0) {
                buttons[0].className += ' ' + this.options.firstButtonClass;
                buttons[buttons.length - 1].className += ' ' + this.options.lastButtonClass;
            }
            return this;
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

        // TODO: move these two methods to selection.js
        // http://stackoverflow.com/questions/15867542/range-object-get-selection-parent-node-chrome-vs-firefox
        rangeSelectsSingleNode: function (range) {
            var startNode = range.startContainer;
            return startNode === range.endContainer &&
                startNode.hasChildNodes() &&
                range.endOffset === range.startOffset + 1;
        },

        getSelectedParentElement: function () {
            var selectedParentElement = null,
                range = this.selectionRange;
            if (this.rangeSelectsSingleNode(range) && range.startContainer.childNodes[range.startOffset].nodeType !== 3) {
                selectedParentElement = range.startContainer.childNodes[range.startOffset];
            } else if (range.startContainer.nodeType === 3) {
                selectedParentElement = range.startContainer.parentNode;
            } else {
                selectedParentElement = range.startContainer;
            }
            return selectedParentElement;
        },

        execFormatBlock: function (el) {
            var selectionData = meSelection.getSelectionData(this.selection.anchorNode);
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
            if (mediumEditorUtil.isIE) {
                if (el === 'blockquote') {
                    return this.options.ownerDocument.execCommand('indent', false, el);
                }
                el = '<' + el + '>';
            }
            return this.options.ownerDocument.execCommand('formatBlock', false, el);
        },

        isToolbarDefaultActionsShown: function () {
            return !!this.toolbarActions && this.toolbarActions.style.display === 'block';
        },

        hideToolbarDefaultActions: function () {
            if (this.toolbarActions && this.isToolbarDefaultActionsShown()) {
                this.commands.forEach(function (extension) {
                    if (extension.onHide && typeof extension.onHide === 'function') {
                        extension.onHide();
                    }
                });
                this.toolbarActions.style.display = 'none';
            }
        },

        showToolbarDefaultActions: function () {
            this.hideExtensionForms();

            if (this.toolbarActions && !this.isToolbarDefaultActionsShown()) {
                this.toolbarActions.style.display = 'block';
            }

            this.keepToolbarAlive = false;
            // Using setTimeout + options.delay because:
            // We will actually be displaying the toolbar, which should be controlled by options.delay
            this.delay(function () {
                this.showToolbar();
            }.bind(this));

            return this;
        },

        hideExtensionForms: function () {
            // Hide all extension forms
            this.commands.forEach(function (extension) {
                if (extension.hasForm && extension.isDisplayed()) {
                    extension.hideForm();
                }
            });
        },

        isToolbarShown: function () {
            return this.toolbar && this.toolbar.classList.contains('medium-editor-toolbar-active');
        },

        showToolbar: function () {
            if (this.toolbar && !this.isToolbarShown()) {
                this.toolbar.classList.add('medium-editor-toolbar-active');
                if (typeof this.options.onShowToolbar === 'function') {
                    this.options.onShowToolbar();
                }
            }
        },

        hideToolbar: function () {
            if (this.isToolbarShown()) {
                this.toolbar.classList.remove('medium-editor-toolbar-active');
                if (typeof this.options.onHideToolbar === 'function') {
                    this.options.onHideToolbar();
                }
            }
        },

        hideToolbarActions: function () {
            this.commands.forEach(function (extension) {
                if (extension.onHide && typeof extension.onHide === 'function') {
                    extension.onHide();
                }
            });
            this.keepToolbarAlive = false;
            this.hideToolbar();
        },

        selectAllContents: function () {
            var range = this.options.ownerDocument.createRange(),
                sel = this.options.contentWindow.getSelection(),
                currNode = meSelection.getSelectionElement(this.options.contentWindow);

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
                    if (el === range.startContainer || mediumEditorUtil.isDescendant(el, range.startContainer)) {
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

        createAnchorPreview: function () {
            var self = this,
                anchorPreview = this.options.ownerDocument.createElement('div');

            anchorPreview.id = 'medium-editor-anchor-preview-' + this.id;
            anchorPreview.className = 'medium-editor-anchor-preview';
            anchorPreview.innerHTML = this.anchorPreviewTemplate();
            this.options.elementsContainer.appendChild(anchorPreview);

            this.on(anchorPreview, 'click', function () {
                self.anchorPreviewClickHandler();
            });

            return anchorPreview;
        },

        anchorPreviewTemplate: function () {
            return '<div class="medium-editor-toolbar-anchor-preview" id="medium-editor-toolbar-anchor-preview">' +
                '    <i class="medium-editor-toolbar-anchor-preview-inner"></i>' +
                '</div>';
        },

        anchorPreviewClickHandler: function (event) {
            var range,
                sel,
                anchorExtension = this.getExtensionByName('anchor');

            if (anchorExtension && this.activeAnchor) {
                range = this.options.ownerDocument.createRange();
                range.selectNodeContents(this.activeAnchor);

                sel = this.options.contentWindow.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
                // Using setTimeout + options.delay because:
                // We may actually be displaying the anchor form, which should be controlled by options.delay
                this.delay(function () {
                    if (this.activeAnchor) {
                        anchorExtension.showForm(this.activeAnchor.attributes.href.value);
                    }
                    this.keepToolbarAlive = false;
                }.bind(this));
            }

            this.hideAnchorPreview();
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
                if (this.isToolbarShown()) {
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
                    mediumEditorUtil.setTargetBlank(meSelection.getSelectionStart(this.options.ownerDocument));
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
            var el = meSelection.getSelectionStart(this.options.ownerDocument),
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

        positionToolbarIfShown: function () {
            if (this.isToolbarShown()) {
                this.setToolbarPosition();
            }
        },

        bindWindowActions: function () {
            var self = this;

            // Add a scroll event for sticky toolbar
            if (this.options.staticToolbar && this.options.stickyToolbar) {
                // On scroll, re-position the toolbar
                this.on(this.options.contentWindow, 'scroll', function () {
                    self.positionToolbarIfShown();
                }, true);
            }

            this.on(this.options.contentWindow, 'resize', function () {
                self.handleResize();
            });

            this.bindBlur();

            return this;
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
                this.options.elementsContainer.removeChild(this.anchorPreview);
                this.options.elementsContainer.removeChild(this.toolbar);
                delete this.toolbar;
                delete this.anchorPreview;
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
