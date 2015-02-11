function MediumEditor(elements, options) {
    'use strict';
    return this.init(elements, options);
}

if (typeof module === 'object') {
    module.exports = MediumEditor;
// AMD support
} else if (typeof define === 'function' && define.amd) {
    define(function () {
        'use strict';
        return MediumEditor;
    });
}

(function (window, document) {
    'use strict';

    var now,
        keyCode,
        DefaultButton,
        ButtonsData = {
            'bold': {
                name: 'bold',
                action: 'bold',
                aria: 'bold',
                tagNames: ['b', 'strong'],
                contentDefault: '<b>B</b>',
                contentFA: '<i class="fa fa-bold"></i>'
            },
            'italic': {
                name: 'italic',
                action: 'italic',
                aria: 'italic',
                tagNames: ['i', 'em'],
                style: {
                    prop: 'font-style',
                    value: 'italic'
                },
                contentDefault: '<b><i>I</i></b>',
                contentFA: '<i class="fa fa-italic"></i>'
            },
            'underline': {
                name: 'underline',
                action: 'underline',
                aria: 'underline',
                tagNames: ['u'],
                contentDefault: '<b><u>U</u></b>',
                contentFA: '<i class="fa fa-underline"></i>'
            },
            'strikethrough': {
                name: 'strikethrough',
                action: 'strikethrough',
                aria: 'strike through',
                tagNames: ['strike'],
                contentDefault: '<s>A</s>',
                contentFA: '<i class="fa fa-strikethrough"></i>'
            },
            'superscript': {
                name: 'superscript',
                action: 'superscript',
                aria: 'superscript',
                tagNames: ['sup'],
                contentDefault: '<b>x<sup>1</sup></b>',
                contentFA: '<i class="fa fa-superscript"></i>'
            },
            'subscript': {
                name: 'subscript',
                action: 'subscript',
                aria: 'subscript',
                tagNames: ['sub'],
                contentDefault: '<b>x<sub>1</sub></b>',
                contentFA: '<i class="fa fa-subscript"></i>'
            },
            'anchor': {
                name: 'anchor',
                action: 'anchor',
                aria: 'link',
                tagNames: ['a'],
                contentDefault: '<b>#</b>',
                contentFA: '<i class="fa fa-link"></i>'
            },
            'image': {
                name: 'image',
                action: 'image',
                aria: 'image',
                tagNames: ['img'],
                contentDefault: '<b>image</b>',
                contentFA: '<i class="fa fa-picture-o"></i>'
            },
            'quote': {
                name: 'quote',
                action: 'append-blockquote',
                aria: 'blockquote',
                tagNames: ['blockquote'],
                contentDefault: '<b>&ldquo;</b>',
                contentFA: '<i class="fa fa-quote-right"></i>'
            },
            'orderedlist': {
                name: 'orderedlist',
                action: 'insertorderedlist',
                aria: 'ordered list',
                tagNames: ['ol'],
                contentDefault: '<b>1.</b>',
                contentFA: '<i class="fa fa-list-ol"></i>'
            },
            'unorderedlist': {
                name: 'unorderedlist',
                action: 'insertunorderedlist',
                aria: 'unordered list',
                tagNames: ['ul'],
                contentDefault: '<b>&bull;</b>',
                contentFA: '<i class="fa fa-list-ul"></i>'
            },
            'pre': {
                name: 'pre',
                action: 'append-pre',
                aria: 'preformatted text',
                tagNames: ['pre'],
                contentDefault: '<b>0101</b>',
                contentFA: '<i class="fa fa-code fa-lg"></i>'
            },
            'indent': {
                name: 'indent',
                action: 'indent',
                aria: 'indent',
                tagNames: [],
                contentDefault: '<b>&rarr;</b>',
                contentFA: '<i class="fa fa-indent"></i>'
            },
            'outdent': {
                name: 'outdent',
                action: 'outdent',
                aria: 'outdent',
                tagNames: [],
                contentDefault: '<b>&larr;</b>',
                contentFA: '<i class="fa fa-outdent"></i>'
            },
            'justifyCenter': {
                name: 'justifyCenter',
                action: 'justifyCenter',
                aria: 'center justify',
                tagNames: [],
                style: {
                    prop: 'text-align',
                    value: 'center'
                },
                contentDefault: '<b>C</b>',
                contentFA: '<i class="fa fa-align-center"></i>'
            },
            'justifyFull': {
                name: 'justifyFull',
                action: 'justifyFull',
                aria: 'full justify',
                tagNames: [],
                style: {
                    prop: 'text-align',
                    value: 'justify'
                },
                contentDefault: '<b>J</b>',
                contentFA: '<i class="fa fa-align-justify"></i>'
            },
            'justifyLeft': {
                name: 'justifyLeft',
                action: 'justifyLeft',
                aria: 'left justify',
                tagNames: [],
                style: {
                    prop: 'text-align',
                    value: 'left'
                },
                contentDefault: '<b>L</b>',
                contentFA: '<i class="fa fa-align-left"></i>'
            },
            'justifyRight': {
                name: 'justifyRight',
                action: 'justifyRight',
                aria: 'right justify',
                tagNames: [],
                style: {
                    prop: 'text-align',
                    value: 'right'
                },
                contentDefault: '<b>R</b>',
                contentFA: '<i class="fa fa-align-right"></i>'
            },
            'header1': {
                name: 'header1',
                action: function (options) {
                    return 'append-' + options.firstHeader;
                },
                aria: function (options) {
                    return options.firstHeader;
                },
                tagNames: function (options) {
                    return [options.firstHeader];
                },
                contentDefault: '<b>H1</b>'
            },
            'header2': {
                name: 'header2',
                action: function (options) {
                    return 'append-' + options.secondHeader;
                },
                aria: function (options) {
                    return options.secondHeader;
                },
                tagNames: function (options) {
                    return [options.secondHeader];
                },
                contentDefault: '<b>H2</b>'
            }
        };

    DefaultButton = function (options, instance) {
        this.options = options;
        this.name = options.name;
        this.init(instance);
    };

    DefaultButton.prototype = {
        init: function (instance) {
            this.base = instance;

            this.button = this.createButton();
            this.base.on(this.button, 'click', this.handleClick.bind(this));
        },
        getButton: function () {
            return this.button;
        },
        getAction: function () {
            return (typeof this.options.action === 'function') ? this.options.action(this.base.options) : this.options.action;
        },
        getAria: function () {
            return (typeof this.options.aria === 'function') ? this.options.aria(this.base.options) : this.options.aria;
        },
        getTagNames: function () {
            return (typeof this.options.tagNames === 'function') ? this.options.tagNames(this.base.options) : this.options.tagNames;
        },
        createButton: function () {
            var button = this.base.options.ownerDocument.createElement('button'),
                content = this.options.contentDefault;
            button.classList.add('medium-editor-action');
            button.classList.add('medium-editor-action-' + this.name);
            button.setAttribute('data-action', this.getAction());
            button.setAttribute('aria-label', this.getAria());
            if (this.base.options.buttonLabels) {
                if (this.base.options.buttonLabels === 'fontawesome' && this.options.contentFA) {
                    content = this.options.contentFA;
                } else if (typeof this.base.options.buttonLabels === 'object' && this.base.options.buttonLabels[this.name]) {
                    content = this.base.options.buttonLabels[this.options.name];
                }
            }
            button.innerHTML = content;
            return button;
        },
        handleClick: function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
            var action = this.getAction();
            if (!this.base.selection) {
                this.base.checkSelection();
            }

            if (this.isActive()) {
                this.deactivate();
            } else {
                this.activate();
            }

            if (action) {
                this.base.execAction(action, evt);
            }
            //if (this.options.form) {
            //    this.base.showForm(this.form, evt);
            //}
        },
        isActive: function () {
            return this.button.classList.contains(this.base.options.activeButtonClass);
        },
        deactivate: function () {
            this.button.classList.remove(this.base.options.activeButtonClass);
            delete this.knownState;
        },
        activate: function () {
            this.button.classList.add(this.base.options.activeButtonClass);
            delete this.knownState;
        },
        shouldActivate: function (node) {
            var isMatch = false,
                tagNames = this.getTagNames();
            if (this.knownState === false || this.knownState === true) {
                return this.knownState;
            }

            if (tagNames && tagNames.length > 0 && node.tagName) {
                isMatch = tagNames.indexOf(node.tagName.toLowerCase()) !== -1;
            }

            if (!isMatch && this.options.style) {
                this.knownState = isMatch = (this.base.options.contentWindow.getComputedStyle(node, null).getPropertyValue(this.options.style.prop).indexOf(this.options.style.value) !== -1);
            }

            return isMatch;
        }
    };

    function extend(b, a) {
        var prop;
        if (b === undefined) {
            return a;
        }
        for (prop in a) {
            if (a.hasOwnProperty(prop) && b.hasOwnProperty(prop) === false) {
                b[prop] = a[prop];
            }
        }
        return b;
    }

    // https://github.com/jashkenas/underscore
    now = Date.now || function () {
        return new Date().getTime();
    };

    keyCode = {
        BACKSPACE: 8,
        TAB: 9,
        ENTER: 13,
        ESCAPE: 27,
        SPACE: 32,
        DELETE: 46
    };

    // https://github.com/jashkenas/underscore
    function throttle(func, wait) {
        var THROTTLE_INTERVAL = 50,
            context,
            args,
            result,
            timeout = null,
            previous = 0,
            later;

        if (!wait && wait !== 0) {
            wait = THROTTLE_INTERVAL;
        }

        later = function () {
            previous = now();
            timeout = null;
            result = func.apply(context, args);
            if (!timeout) {
                context = args = null;
            }
        };

        return function () {
            var currNow = now(),
                remaining = wait - (currNow - previous);
            context = this;
            args = arguments;
            if (remaining <= 0 || remaining > wait) {
                clearTimeout(timeout);
                timeout = null;
                previous = currNow;
                result = func.apply(context, args);
                if (!timeout) {
                    context = args = null;
                }
            } else if (!timeout) {
                timeout = setTimeout(later, remaining);
            }
            return result;
        };
    }

    function isDescendant(parent, child) {
        var node = child.parentNode;
        while (node !== null) {
            if (node === parent) {
                return true;
            }
            node = node.parentNode;
        }
        return false;
    }

    // Find the next node in the DOM tree that represents any text that is being
    // displayed directly next to the targetNode (passed as an argument)
    // Text that appears directly next to the current node can be:
    //  - A sibling text node
    //  - A descendant of a sibling element
    //  - A sibling text node of an ancestor
    //  - A descendant of a sibling element of an ancestor
    function findAdjacentTextNodeWithContent(rootNode, targetNode, ownerDocument) {
        var pastTarget = false,
            nextNode,
            nodeIterator = ownerDocument.createNodeIterator(rootNode, NodeFilter.SHOW_TEXT, null, false);

        // Use a native NodeIterator to iterate over all the text nodes that are descendants
        // of the rootNode.  Once past the targetNode, choose the first non-empty text node
        nextNode = nodeIterator.nextNode();
        while (nextNode) {
            if (nextNode === targetNode) {
                pastTarget = true;
            } else if (pastTarget) {
                if (nextNode.nodeType === 3 && nextNode.nodeValue && nextNode.nodeValue.trim().length > 0) {
                    break;
                }
            }
            nextNode = nodeIterator.nextNode();
        }

        return nextNode;
    }

    // http://stackoverflow.com/questions/5605401/insert-link-in-contenteditable-element
    // by Tim Down
    function saveSelection() {
        var i,
            len,
            ranges,
            sel = this.options.contentWindow.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            ranges = [];
            for (i = 0, len = sel.rangeCount; i < len; i += 1) {
                ranges.push(sel.getRangeAt(i));
            }
            return ranges;
        }
        return null;
    }

    function restoreSelection(savedSel) {
        var i,
            len,
            sel = this.options.contentWindow.getSelection();
        if (savedSel) {
            sel.removeAllRanges();
            for (i = 0, len = savedSel.length; i < len; i += 1) {
                sel.addRange(savedSel[i]);
            }
        }
    }

    // http://stackoverflow.com/questions/1197401/how-can-i-get-the-element-the-caret-is-in-with-javascript-when-using-contentedi
    // by You
    function getSelectionStart() {
        var node = this.options.ownerDocument.getSelection().anchorNode,
            startNode = (node && node.nodeType === 3 ? node.parentNode : node);
        return startNode;
    }

    // http://stackoverflow.com/questions/4176923/html-of-selected-text
    // by Tim Down
    function getSelectionHtml() {
        var i,
            html = '',
            sel,
            len,
            container;
        if (this.options.contentWindow.getSelection !== undefined) {
            sel = this.options.contentWindow.getSelection();
            if (sel.rangeCount) {
                container = this.options.ownerDocument.createElement('div');
                for (i = 0, len = sel.rangeCount; i < len; i += 1) {
                    container.appendChild(sel.getRangeAt(i).cloneContents());
                }
                html = container.innerHTML;
            }
        } else if (this.options.ownerDocument.selection !== undefined) {
            if (this.options.ownerDocument.selection.type === 'Text') {
                html = this.options.ownerDocument.selection.createRange().htmlText;
            }
        }
        return html;
    }

    /**
     *  Find the caret position within an element irrespective of any inline tags it may contain.
     *
     *  @param {DOMElement} An element containing the cursor to find offsets relative to.
     *  @param {Range} A Range representing cursor position. Will window.getSelection if none is passed.
     *  @return {Object} 'left' and 'right' attributes contain offsets from begining and end of Element
     */
    function getCaretOffsets(element, range) {
        var preCaretRange, postCaretRange;

        if (!range) {
            range = window.getSelection().getRangeAt(0);
        }

        preCaretRange = range.cloneRange();
        postCaretRange = range.cloneRange();

        preCaretRange.selectNodeContents(element);
        preCaretRange.setEnd(range.endContainer, range.endOffset);

        postCaretRange.selectNodeContents(element);
        postCaretRange.setStart(range.endContainer, range.endOffset);

        return {
            left: preCaretRange.toString().length,
            right: postCaretRange.toString().length
        };
    }


    // https://github.com/jashkenas/underscore
    function isElement(obj) {
        return !!(obj && obj.nodeType === 1);
    }

    MediumEditor.statics = {
        ButtonsData: ButtonsData,
        DefaultButton: DefaultButton
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
            disableAnchorForm: false,
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

        // http://stackoverflow.com/questions/17907445/how-to-detect-ie11#comment30165888_17907562
        // by rg89
        isIE: ((navigator.appName === 'Microsoft Internet Explorer') || ((navigator.appName === 'Netscape') && (new RegExp('Trident/.*rv:([0-9]{1,}[.0-9]{0,})').exec(navigator.userAgent) !== null))),

        init: function (elements, options) {
            var uniqueId = 1;

            this.options = extend(options, this.defaults);
            this.setElementSelection(elements);
            if (this.elements.length === 0) {
                return;
            }
            this.parentElements = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre'];
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
            this.handleResize = throttle(function () {
                if (self.isActive) {
                    self.positionToolbarIfShown();
                }
            });

            // handleBlur is throttled because:
            // - This method could be called many times due to the type of event handlers that are calling it
            // - We want a slight delay so that other events in the stack can run, some of which may
            //   prevent the toolbar from being hidden (via this.keepToolbarAlive).
            this.handleBlur = throttle(function () {
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
                    .bindButtons()
                    .bindAnchorForm()
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
            if (isElement(selector)) {
                selector = [selector];
            }
            // Convert NodeList (or other array like object) into an array
            this.elements = Array.prototype.slice.apply(selector);
        },

        bindBlur: function () {
            var self = this,
                blurFunction = function (e) {
                    var isDescendantOfEditorElements = false,
                        i;
                    for (i = 0; i < self.elements.length; i += 1) {
                        if (isDescendant(self.elements[i], e.target)) {
                            isDescendantOfEditorElements = true;
                            break;
                        }
                    }
                    // If it's not part of the editor, or the toolbar
                    if (e.target !== self.toolbar
                            && self.elements.indexOf(e.target) === -1
                            && !isDescendantOfEditorElements
                            && !isDescendant(self.toolbar, e.target)
                            && !isDescendant(self.anchorPreview, e.target)) {

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
                if (e.which === keyCode.SPACE) {
                    node = getSelectionStart.call(self);
                    tagName = node.tagName.toLowerCase();
                    if (tagName === 'a') {
                        self.options.ownerDocument.execCommand('unlink', false, null);
                    }
                }
            });

            this.on(this.elements[index], 'keyup', function (e) {
                var node = getSelectionStart.call(self),
                    tagName,
                    editorElement;

                if (node && node.getAttribute('data-medium-element') && node.children.length === 0 && !(self.options.disableReturn || node.getAttribute('data-disable-return'))) {
                    self.options.ownerDocument.execCommand('formatBlock', false, 'p');
                }
                if (e.which === keyCode.ENTER) {
                    node = getSelectionStart.call(self);
                    tagName = node.tagName.toLowerCase();
                    editorElement = self.getSelectionElement();

                    if (!(self.options.disableReturn || editorElement.getAttribute('data-disable-return')) &&
                            tagName !== 'li' && !self.isListItemChild(node)) {
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

        isListItemChild: function (node) {
            var parentNode = node.parentNode,
                tagName = parentNode.tagName.toLowerCase();
            while (this.parentElements.indexOf(tagName) === -1 && tagName !== 'div') {
                if (tagName === 'li') {
                    return true;
                }
                parentNode = parentNode.parentNode;
                if (parentNode && parentNode.tagName) {
                    tagName = parentNode.tagName.toLowerCase();
                } else {
                    return false;
                }
            }
            return false;
        },

        bindReturn: function (index) {
            var self = this;
            this.on(this.elements[index], 'keypress', function (e) {
                if (e.which === keyCode.ENTER) {
                    if (self.options.disableReturn || this.getAttribute('data-disable-return')) {
                        e.preventDefault();
                    } else if (self.options.disableDoubleReturn || this.getAttribute('data-disable-double-return')) {
                        var node = getSelectionStart.call(self);
                        if (node && node.textContent === '\n') {
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

                if (e.which === keyCode.TAB) {
                    // Override tab only for pre nodes
                    var node = getSelectionStart.call(self) || e.target,
                        tag = node && node.tagName.toLowerCase();

                    if (tag === 'pre') {
                        e.preventDefault();
                        self.options.ownerDocument.execCommand('insertHtml', null, '    ');
                    }

                    // Tab to indent list structures!
                    if (tag === 'li' || self.isListItemChild(node)) {
                        e.preventDefault();

                        // If Shift is down, outdent, otherwise indent
                        if (e.shiftKey) {
                            self.options.ownerDocument.execCommand('outdent', e);
                        } else {
                            self.options.ownerDocument.execCommand('indent', e);
                        }
                    }
                } else if (e.which === keyCode.BACKSPACE || e.which === keyCode.DELETE || e.which === keyCode.ENTER) {

                    // Bind keys which can create or destroy a block element: backspace, delete, return
                    self.onBlockModifier(e);

                }
            });
            return this;
        },

        onBlockModifier: function (e) {
            var range, sel, p, node = getSelectionStart.call(this),
                tagName = node.tagName.toLowerCase(),
                isEmpty = /^(\s+|<br\/?>)?$/i,
                isHeader = /h\d/i;

            if ((e.which === keyCode.BACKSPACE || e.which === keyCode.ENTER)
                    && node.previousElementSibling
                    // in a header
                    && isHeader.test(tagName)
                    // at the very end of the block
                    && getCaretOffsets(node).left === 0) {
                if (e.which === keyCode.BACKSPACE && isEmpty.test(node.previousElementSibling.innerHTML)) {
                    // backspacing the begining of a header into an empty previous element will
                    // change the tagName of the current node to prevent one
                    // instead delete previous node and cancel the event.
                    node.previousElementSibling.parentNode.removeChild(node.previousElementSibling);
                    e.preventDefault();
                } else if (e.which === keyCode.ENTER) {
                    // hitting return in the begining of a header will create empty header elements before the current one
                    // instead, make "<p><br></p>" element, which are what happens if you hit return in an empty paragraph
                    p = this.options.ownerDocument.createElement('p');
                    p.innerHTML = '<br>';
                    node.previousElementSibling.parentNode.insertBefore(p, node);
                    e.preventDefault();
                }
            } else if (e.which === keyCode.DELETE
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

            if (!this.options.disableAnchorForm) {
                this.anchorForm = this.toolbar.querySelector('.medium-editor-toolbar-form');
                this.anchorInput = this.anchorForm.querySelector('input.medium-editor-toolbar-input');
                this.anchorTarget = this.anchorForm.querySelector('input.medium-editor-toolbar-anchor-target');
                this.anchorButton = this.anchorForm.querySelector('input.medium-editor-toolbar-anchor-button');
            }

            this.addExtensionForms();

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
            if (!this.options.disableAnchorForm) {
                toolbar.appendChild(this.toolbarFormAnchor());
            }
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
                    if (isElement(btn)) {
                        li.appendChild(btn);
                    } else {
                        li.innerHTML = btn;
                    }
                    ul.appendChild(li);
                }
            }.bind(this));

            return ul;
        },

        addExtensionForms: function () {
            var form,
                id;

            this.commands.forEach(function (extension) {
                if (extension.hasForm) {
                    form = (typeof extension.getForm === 'function') ? extension.getForm() : null;
                }
                if (form) {
                    id = 'medium-editor-toolbar-form-' + extension.name + '-' + this.id;
                    form.className += ' medium-editor-toolbar-form';
                    form.id = id;
                    this.toolbar.appendChild(form);
                }
            }.bind(this));
        },

        toolbarFormAnchor: function () {
            var anchor = this.options.ownerDocument.createElement('div'),
                input = this.options.ownerDocument.createElement('input'),
                target_label = this.options.ownerDocument.createElement('label'),
                target = this.options.ownerDocument.createElement('input'),
                button_label = this.options.ownerDocument.createElement('label'),
                button = this.options.ownerDocument.createElement('input'),
                close = this.options.ownerDocument.createElement('a'),
                save = this.options.ownerDocument.createElement('a');

            close.setAttribute('href', '#');
            close.className = 'medium-editor-toobar-close';
            close.innerHTML = '&times;';

            save.setAttribute('href', '#');
            save.className = 'medium-editor-toobar-save';
            save.innerHTML = '&#10003;';

            input.setAttribute('type', 'text');
            input.className = 'medium-editor-toolbar-input';
            input.setAttribute('placeholder', this.options.anchorInputPlaceholder);


            target.setAttribute('type', 'checkbox');
            target.className = 'medium-editor-toolbar-anchor-target';
            target_label.innerHTML = this.options.anchorInputCheckboxLabel;
            target_label.insertBefore(target, target_label.firstChild);

            button.setAttribute('type', 'checkbox');
            button.className = 'medium-editor-toolbar-anchor-button';
            button_label.innerHTML = "Button";
            button_label.insertBefore(button, button_label.firstChild);


            anchor.className = 'medium-editor-toolbar-form';
            anchor.id = 'medium-editor-toolbar-form-anchor-' + this.id;
            anchor.appendChild(input);

            anchor.appendChild(save);
            anchor.appendChild(close);

            if (this.options.anchorTarget) {
                anchor.appendChild(target_label);
            }

            if (this.options.anchorButton) {
                anchor.appendChild(button_label);
            }

            return anchor;
        },

        bindSelect: function () {
            var self = this,
                i,
                timer;

            this.checkSelectionWrapper = function (e) {
                e.stopPropagation();

                clearTimeout(timer);

                // Do not close the toolbar when bluring the editable area and clicking into the anchor form
                if (!self.options.disableAnchorForm && e && self.clickingIntoArchorForm(e)) {
                    return false;
                }

                timer = setTimeout(function () {
                    self.checkSelection();
                }, 10);
            };

            this.on(this.options.ownerDocument.documentElement, 'mouseup', this.checkSelectionWrapper);

            for (i = 0; i < this.elements.length; i += 1) {
                this.on(this.elements[i], 'keyup', this.checkSelectionWrapper);
                this.on(this.elements[i], 'blur', this.checkSelectionWrapper);
                this.on(this.elements[i], 'mouseup', this.checkSelectionWrapper);
            }

            return this;
        },

        // http://stackoverflow.com/questions/6690752/insert-html-at-caret-in-a-contenteditable-div
        insertHTML: function insertHTML(html) {
            var selection, range, el, fragment, node, lastNode;

            if (this.options.ownerDocument.queryCommandSupported('insertHTML')) {
                try {
                    return this.options.ownerDocument.execCommand('insertHTML', false, html);
                } catch (ignore) {}
            }

            selection = window.getSelection();
            if (selection.getRangeAt && selection.rangeCount) {
                range = selection.getRangeAt(0);
                range.deleteContents();

                el = this.options.ownerDocument.createElement("div");
                el.innerHTML = html;
                fragment = this.options.ownerDocument.createDocumentFragment();
                while (el.firstChild) {
                    node = el.firstChild;
                    lastNode = fragment.appendChild(node);
                }
                range.insertNode(fragment);

                // Preserve the selection:
                if (lastNode) {
                    range = range.cloneRange();
                    range.setStartAfter(lastNode);
                    range.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            }
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
                        self.insertHTML('<img class="medium-image-loading" id="' + id + '" />');

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
                        (this.options.allowMultiParagraphSelection === false && this.hasMultiParagraphs()) ||
                        this.selectionInContentEditableFalse()) {

                    if (!this.options.staticToolbar) {
                        this.hideToolbarActions();
                    } else if (this.anchorForm && this.anchorForm.style.display === 'block') {
                        this.setToolbarButtonStates();
                        this.showToolbarActions();
                    }

                } else {
                    selectionElement = this.getSelectionElement();
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

        clickingIntoArchorForm: function (e) {
            var self = this;

            if (e.type && e.type.toLowerCase() === 'blur' && e.relatedTarget && e.relatedTarget === self.anchorInput) {
                return true;
            }

            return false;
        },

        hasMultiParagraphs: function () {
            var selectionHtml = getSelectionHtml.call(this).replace(/<[\S]+><\/[\S]+>/gim, ''),
                hasMultiParagraphs = selectionHtml.match(/<(p|h[0-6]|blockquote)>([\s\S]*?)<\/(p|h[0-6]|blockquote)>/g);

            return (hasMultiParagraphs ? hasMultiParagraphs.length : 0);
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
                adjacentNode = findAdjacentTextNodeWithContent(this.getSelectionElement(), this.selectionRange.startContainer, this.options.ownerDocument);
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
                    this.setToolbarButtonStates()
                        .setToolbarPosition()
                        .showToolbarActions();
                    return;
                }
            }

            if (!this.options.staticToolbar) {
                this.hideToolbarActions();
            }
        },

        traverseUp: function (current, testElementFunction) {

            do {
                if (current.nodeType === 1) {
                    if (testElementFunction(current)) {
                        return current;
                    }
                    // do not traverse upwards past the nearest containing editor
                    if (current.getAttribute('data-medium-element')) {
                        return false;
                    }
                }

                current = current.parentNode;
            } while (current);

            return false;

        },

        findMatchingSelectionParent: function (testElementFunction) {
            var selection = this.options.contentWindow.getSelection(), range, current;

            if (selection.rangeCount === 0) {
                return false;
            }

            range = selection.getRangeAt(0);
            current = range.commonAncestorContainer;

            return this.traverseUp(current, testElementFunction);

        },

        getSelectionElement: function () {
            return this.findMatchingSelectionParent(function (el) {
                return el.getAttribute('data-medium-element');
            });
        },

        selectionInContentEditableFalse: function () {
            return this.findMatchingSelectionParent(function (el) {
                return (el && el.nodeName !== '#text' && el.getAttribute('contenteditable') === 'false');
            });
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

            if (selection.focusNode === null) {
                return this;
            }

            this.showToolbar();

            if (this.options.staticToolbar) {

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

            } else if (!selection.isCollapsed) {
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
            }

            this.hideAnchorPreview();

            return this;
        },

        setToolbarButtonStates: function () {
            this.commands.forEach(function (extension) {
                if (typeof extension.deactivate === 'function') {
                    extension.deactivate();
                }
            }.bind(this));
            this.checkActiveButtons();
            return this;
        },

        checkActiveButtons: function () {
            var elements = Array.prototype.slice.call(this.elements),
                parentNode = this.getSelectedParentElement(),
                checkExtension = function (extension) {
                    if (typeof extension.checkState === 'function') {
                        extension.checkState(parentNode);
                    } else if (typeof extension.isActive === 'function') {
                        if (!extension.isActive() && extension.shouldActivate(parentNode)) {
                            extension.activate();
                        }
                    }
                };
            while (parentNode.tagName !== undefined && this.parentElements.indexOf(parentNode.tagName.toLowerCase) === -1) {
                this.activateButton(parentNode.tagName.toLowerCase());
                this.commands.forEach(checkExtension.bind(this));

                // we can abort the search upwards if we leave the contentEditable element
                if (elements.indexOf(parentNode) !== -1) {
                    break;
                }
                parentNode = parentNode.parentNode;
            }
        },

        activateButton: function (tag) {
            var el = this.toolbar.querySelector('[data-element="' + tag + '"]');
            if (el !== null && !el.classList.contains(this.options.activeButtonClass)) {
                el.classList.add(this.options.activeButtonClass);
            }
        },

        bindButtons: function () {
            this.setFirstAndLastItems(this.toolbar.querySelectorAll('button'));
            return this;
        },

        setFirstAndLastItems: function (buttons) {
            if (buttons.length > 0) {

                buttons[0].className += ' ' + this.options.firstButtonClass;
                buttons[buttons.length - 1].className += ' ' + this.options.lastButtonClass;
            }
            return this;
        },

        execAction: function (action, e) {
            if (action.indexOf('append-') > -1) {
                this.execFormatBlock(action.replace('append-', ''));
                this.setToolbarPosition();
                this.setToolbarButtonStates();
            } else if (action === 'anchor') {
                if (!this.options.disableAnchorForm) {
                    this.triggerAnchorAction(e);
                }
            } else if (action === 'image') {
                this.options.ownerDocument.execCommand('insertImage', false, this.options.contentWindow.getSelection());
            } else {
                this.options.ownerDocument.execCommand(action, false, null);
                this.setToolbarPosition();
                if (action.indexOf('justify') === 0) {
                    this.setToolbarButtonStates();
                }
            }
        },

        // Method to show an extension's form
        // TO DO: Improve this
        showForm: function (formId, e) {
            this.toolbarActions.style.display = 'none';
            this.saveSelection();
            var form = document.getElementById(formId);
            form.style.display = 'block';
            this.setToolbarPosition();
            this.keepToolbarAlive = true;
        },

        // Method to show an extension's form
        // TO DO: Improve this
        hideForm: function (form, e) {
            var el = document.getElementById(form.id);
            el.style.display = 'none';
            this.showToolbarActions();
            this.setToolbarPosition();
            restoreSelection.call(this, this.savedSelection);
        },

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

        triggerAnchorAction: function () {
            var selectedParentElement = this.getSelectedParentElement();
            if (selectedParentElement.tagName &&
                    selectedParentElement.tagName.toLowerCase() === 'a') {
                this.options.ownerDocument.execCommand('unlink', false, null);
            } else if (this.anchorForm) {
                if (this.anchorForm.style.display === 'block') {
                    this.showToolbarActions();
                } else {
                    this.showAnchorForm();
                }
            }
            return this;
        },

        execFormatBlock: function (el) {
            var selectionData = this.getSelectionData(this.selection.anchorNode);
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
            if (this.isIE) {
                if (el === 'blockquote') {
                    return this.options.ownerDocument.execCommand('indent', false, el);
                }
                el = '<' + el + '>';
            }
            return this.options.ownerDocument.execCommand('formatBlock', false, el);
        },

        getSelectionData: function (el) {
            var tagName;

            if (el && el.tagName) {
                tagName = el.tagName.toLowerCase();
            }

            while (el && this.parentElements.indexOf(tagName) === -1) {
                el = el.parentNode;
                if (el && el.tagName) {
                    tagName = el.tagName.toLowerCase();
                }
            }

            return {
                el: el,
                tagName: tagName
            };
        },

        getFirstChild: function (el) {
            var firstChild = el.firstChild;
            while (firstChild !== null && firstChild.nodeType !== 1) {
                firstChild = firstChild.nextSibling;
            }
            return firstChild;
        },

        isToolbarShown: function () {
            return this.toolbar && this.toolbar.classList.contains('medium-editor-toolbar-active');
        },

        showToolbar: function () {
            if (this.toolbar && !this.isToolbarShown()) {
                this.toolbar.classList.add('medium-editor-toolbar-active');
                if (this.onShowToolbar) {
                    this.onShowToolbar();
                }
            }
        },

        hideToolbar: function () {
            if (this.isToolbarShown()) {
                this.toolbar.classList.remove('medium-editor-toolbar-active');
                // TODO: this should be an option?
                if (this.onHideToolbar) {
                    this.onHideToolbar();
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

        showToolbarActions: function () {
            var self = this;
            if (this.anchorForm) {
                this.anchorForm.style.display = 'none';
            }
            this.toolbarActions.style.display = 'block';
            this.keepToolbarAlive = false;
            // Using setTimeout + options.delay because:
            // We will actually be displaying the toolbar, which should be controlled by options.delay
            this.delay(function () {
                self.showToolbar();
            });
        },

        saveSelection: function () {
            this.savedSelection = saveSelection.call(this);
        },

        restoreSelection: function () {
            restoreSelection.call(this, this.savedSelection);
        },

        showAnchorForm: function (link_value) {
            if (!this.anchorForm) {
                return;
            }

            this.toolbarActions.style.display = 'none';
            this.saveSelection();
            this.anchorForm.style.display = 'block';
            this.setToolbarPosition();
            this.keepToolbarAlive = true;
            this.anchorInput.focus();
            this.anchorInput.value = link_value || '';
        },

        bindAnchorForm: function () {
            if (!this.anchorForm) {
                return this;
            }

            var linkCancel = this.anchorForm.querySelector('a.medium-editor-toobar-close'),
                linkSave = this.anchorForm.querySelector('a.medium-editor-toobar-save'),
                self = this;

            this.on(this.anchorForm, 'click', function (e) {
                e.stopPropagation();
                self.keepToolbarAlive = true;
            });

            this.on(this.anchorInput, 'keyup', function (e) {
                var button = null,
                    target;

                if (e.keyCode === keyCode.ENTER) {
                    e.preventDefault();
                    if (self.options.anchorTarget && self.anchorTarget.checked) {
                        target = "_blank";
                    } else {
                        target = "_self";
                    }

                    if (self.options.anchorButton && self.anchorButton.checked) {
                        button = self.options.anchorButtonClass;
                    }

                    self.createLink(this, target, button);
                } else if (e.keyCode === keyCode.ESCAPE) {
                    e.preventDefault();
                    self.showToolbarActions();
                    restoreSelection.call(self, self.savedSelection);
                }
            });

            this.on(linkSave, 'click', function (e) {
                var button = null,
                    target;
                e.preventDefault();
                if (self.options.anchorTarget && self.anchorTarget.checked) {
                    target = "_blank";
                } else {
                    target = "_self";
                }

                if (self.options.anchorButton && self.anchorButton.checked) {
                    button = self.options.anchorButtonClass;
                }

                self.createLink(self.anchorInput, target, button);
            }, true);

            this.on(this.anchorInput, 'click', function (e) {
                // make sure not to hide form when cliking into the input
                e.stopPropagation();
                self.keepToolbarAlive = true;
            });

            // Hide the anchor form when focusing outside of it.
            this.on(this.options.ownerDocument.body, 'click', function (e) {
                if (e.target !== self.anchorForm && !isDescendant(self.anchorForm, e.target) && !isDescendant(self.toolbarActions, e.target)) {
                    self.keepToolbarAlive = false;
                    self.checkSelection();
                }
            }, true);
            this.on(this.options.ownerDocument.body, 'focus', function (e) {
                if (e.target !== self.anchorForm && !isDescendant(self.anchorForm, e.target) && !isDescendant(self.toolbarActions, e.target)) {
                    self.keepToolbarAlive = false;
                    self.checkSelection();
                }
            }, true);

            this.on(linkCancel, 'click', function (e) {
                e.preventDefault();
                self.showToolbarActions();
                restoreSelection.call(self, self.savedSelection);
            });
            return this;
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

        anchorPreviewClickHandler: function (e) {
            if (!this.options.disableAnchorForm && this.activeAnchor) {

                var self = this,
                    range = this.options.ownerDocument.createRange(),
                    sel = this.options.contentWindow.getSelection();

                range.selectNodeContents(self.activeAnchor);
                sel.removeAllRanges();
                sel.addRange(range);
                // Using setTimeout + options.delay because:
                // We may actually be displaying the anchor preview, which should be controlled by options.delay
                this.delay(function () {
                    if (self.activeAnchor) {
                        self.showAnchorForm(self.activeAnchor.attributes.href.value);
                    }
                    self.keepToolbarAlive = false;
                });

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

        checkLinkFormat: function (value) {
            var re = /^(https?|ftps?|rtmpt?):\/\/|mailto:/;
            return (re.test(value) ? '' : 'http://') + value;
        },

        setTargetBlank: function (el) {
            var i;
            el = el || getSelectionStart.call(this);
            if (el.tagName.toLowerCase() === 'a') {
                el.target = '_blank';
            } else {
                el = el.getElementsByTagName('a');

                for (i = 0; i < el.length; i += 1) {
                    el[i].target = '_blank';
                }
            }
        },

        setButtonClass: function (buttonClass) {
            var el = getSelectionStart.call(this),
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

        createLink: function (input, target, buttonClass) {
            var i, event;

            this.createLinkInternal(input.value, target, buttonClass);

            if (this.options.targetBlank || target === "_blank" || buttonClass) {
                event = this.options.ownerDocument.createEvent("HTMLEvents");
                event.initEvent("input", true, true, this.options.contentWindow);
                for (i = 0; i < this.elements.length; i += 1) {
                    this.elements[i].dispatchEvent(event);
                }
            }

            this.checkSelection();
            this.showToolbarActions();
            input.value = '';
        },

        createLinkInternal: function (url, target, buttonClass) {
            if (!url || url.trim().length === 0) {
                this.hideToolbarActions();
                return;
            }

            restoreSelection.call(this, this.savedSelection);

            if (this.options.checkLinkFormat) {
                url = this.checkLinkFormat(url);
            }

            this.options.ownerDocument.execCommand('createLink', false, url);

            if (this.options.targetBlank || target === "_blank") {
                this.setTargetBlank();
            }

            if (buttonClass) {
                this.setButtonClass(buttonClass);
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

            this.removeAllEvents();
        },

        htmlEntities: function (str) {
            // converts special characters (like <) into their escaped/encoded values (like &lt;).
            // This allows you to show to display the string without the browser reading it as HTML.
            return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        },

        bindPaste: function () {
            var i, self = this;
            this.pasteWrapper = function (e) {
                var paragraphs,
                    html = '',
                    p,
                    dataFormatHTML = 'text/html',
                    dataFormatPlain = 'text/plain';

                this.classList.remove('medium-editor-placeholder');
                if (!self.options.forcePlainText && !self.options.cleanPastedHTML) {
                    return this;
                }

                if (self.options.contentWindow.clipboardData && e.clipboardData === undefined) {
                    e.clipboardData = self.options.contentWindow.clipboardData;
                    // If window.clipboardData exists, but e.clipboardData doesn't exist,
                    // we're probably in IE. IE only has two possibilities for clipboard
                    // data format: 'Text' and 'URL'.
                    //
                    // Of the two, we want 'Text':
                    dataFormatHTML = 'Text';
                    dataFormatPlain = 'Text';
                }

                if (e.clipboardData && e.clipboardData.getData && !e.defaultPrevented) {
                    e.preventDefault();

                    if (self.options.cleanPastedHTML && e.clipboardData.getData(dataFormatHTML)) {
                        return self.cleanPaste(e.clipboardData.getData(dataFormatHTML));
                    }
                    if (!(self.options.disableReturn || this.getAttribute('data-disable-return'))) {
                        paragraphs = e.clipboardData.getData(dataFormatPlain).split(/[\r\n]/g);
                        for (p = 0; p < paragraphs.length; p += 1) {
                            if (paragraphs[p] !== '') {
                                html += '<p>' + self.htmlEntities(paragraphs[p]) + '</p>';
                            }
                        }
                        self.insertHTML(html);
                    } else {
                        html = self.htmlEntities(e.clipboardData.getData(dataFormatPlain));
                        self.insertHTML(html);
                    }
                }
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

            /*jslint regexp: true*/
            /*
                jslint does not allow character negation, because the negation
                will not match any unicode characters. In the regexes in this
                block, negation is used specifically to match the end of an html
                tag, and in fact unicode characters *should* be allowed.
            */
            var i, elList, workEl,
                el = this.getSelectionElement(),
                multiline = /<p|<br|<div/.test(text),
                replacements = [

                    // replace two bogus tags that begin pastes from google docs
                    [new RegExp(/<[^>]*docs-internal-guid[^>]*>/gi), ""],
                    [new RegExp(/<\/b>(<br[^>]*>)?$/gi), ""],

                     // un-html spaces and newlines inserted by OS X
                    [new RegExp(/<span class="Apple-converted-space">\s+<\/span>/g), ' '],
                    [new RegExp(/<br class="Apple-interchange-newline">/g), '<br>'],

                    // replace google docs italics+bold with a span to be replaced once the html is inserted
                    [new RegExp(/<span[^>]*(font-style:italic;font-weight:bold|font-weight:bold;font-style:italic)[^>]*>/gi), '<span class="replace-with italic bold">'],

                    // replace google docs italics with a span to be replaced once the html is inserted
                    [new RegExp(/<span[^>]*font-style:italic[^>]*>/gi), '<span class="replace-with italic">'],

                    //[replace google docs bolds with a span to be replaced once the html is inserted
                    [new RegExp(/<span[^>]*font-weight:bold[^>]*>/gi), '<span class="replace-with bold">'],

                     // replace manually entered b/i/a tags with real ones
                    [new RegExp(/&lt;(\/?)(i|b|a)&gt;/gi), '<$1$2>'],

                     // replace manually a tags with real ones, converting smart-quotes from google docs
                    [new RegExp(/&lt;a\s+href=(&quot;|&rdquo;|&ldquo;|“|”)([^&]+)(&quot;|&rdquo;|&ldquo;|“|”)&gt;/gi), '<a href="$2">']

                ];
            /*jslint regexp: false*/

            for (i = 0; i < replacements.length; i += 1) {
                text = text.replace(replacements[i][0], replacements[i][1]);
            }

            if (multiline) {

                // double br's aren't converted to p tags, but we want paragraphs.
                elList = text.split('<br><br>');

                this.pasteHTML('<p>' + elList.join('</p><p>') + '</p>');
                this.options.ownerDocument.execCommand('insertText', false, "\n");

                // block element cleanup
                elList = el.querySelectorAll('a,p,div,br');
                for (i = 0; i < elList.length; i += 1) {

                    workEl = elList[i];

                    switch (workEl.tagName.toLowerCase()) {
                    case 'a':
                        if (this.options.targetBlank) {
                            this.setTargetBlank(workEl);
                        }
                        break;
                    case 'p':
                    case 'div':
                        this.filterCommonBlocks(workEl);
                        break;
                    case 'br':
                        this.filterLineBreak(workEl);
                        break;
                    }

                }


            } else {

                this.pasteHTML(text);

            }

        },

        pasteHTML: function (html) {
            var elList, workEl, i, fragmentBody, pasteBlock = this.options.ownerDocument.createDocumentFragment();

            pasteBlock.appendChild(this.options.ownerDocument.createElement('body'));

            fragmentBody = pasteBlock.querySelector('body');
            fragmentBody.innerHTML = html;

            this.cleanupSpans(fragmentBody);

            elList = fragmentBody.querySelectorAll('*');
            for (i = 0; i < elList.length; i += 1) {

                workEl = elList[i];

                // delete ugly attributes
                workEl.removeAttribute('class');
                workEl.removeAttribute('style');
                workEl.removeAttribute('dir');

                if (workEl.tagName.toLowerCase() === 'meta') {
                    workEl.parentNode.removeChild(workEl);
                }

            }
            this.insertHTML(fragmentBody.innerHTML.replace(/&nbsp;/g, ' '));
        },
        isCommonBlock: function (el) {
            return (el && (el.tagName.toLowerCase() === 'p' || el.tagName.toLowerCase() === 'div'));
        },
        filterCommonBlocks: function (el) {
            if (/^\s*$/.test(el.textContent)) {
                el.parentNode.removeChild(el);
            }
        },
        filterLineBreak: function (el) {
            if (this.isCommonBlock(el.previousElementSibling)) {

                // remove stray br's following common block elements
                el.parentNode.removeChild(el);

            } else if (this.isCommonBlock(el.parentNode) && (el.parentNode.firstChild === el || el.parentNode.lastChild === el)) {

                // remove br's just inside open or close tags of a div/p
                el.parentNode.removeChild(el);

            } else if (el.parentNode.childElementCount === 1) {

                // and br's that are the only child of a div/p
                this.removeWithParent(el);

            }

        },

        // remove an element, including its parent, if it is the only element within its parent
        removeWithParent: function (el) {
            if (el && el.parentNode) {
                if (el.parentNode.parentNode && el.parentNode.childElementCount === 1) {
                    el.parentNode.parentNode.removeChild(el.parentNode);
                } else {
                    el.parentNode.removeChild(el.parentNode);
                }
            }
        },

        cleanupSpans: function (container_el) {

            var i,
                el,
                new_el,
                spans = container_el.querySelectorAll('.replace-with'),
                isCEF = function (el) {
                    return (el && el.nodeName !== '#text' && el.getAttribute('contenteditable') === 'false');
                };

            for (i = 0; i < spans.length; i += 1) {

                el = spans[i];
                new_el = this.options.ownerDocument.createElement(el.classList.contains('bold') ? 'b' : 'i');

                if (el.classList.contains('bold') && el.classList.contains('italic')) {

                    // add an i tag as well if this has both italics and bold
                    new_el.innerHTML = '<i>' + el.innerHTML + '</i>';

                } else {

                    new_el.innerHTML = el.innerHTML;

                }
                el.parentNode.replaceChild(new_el, el);

            }

            spans = container_el.querySelectorAll('span');
            for (i = 0; i < spans.length; i += 1) {

                el = spans[i];

                // bail if span is in contenteditable = false
                if (this.traverseUp(el, isCEF)) {
                    return false;
                }

                // remove empty spans, replace others with their contents
                if (/^\s*$/.test()) {
                    el.parentNode.removeChild(el);
                } else {
                    el.parentNode.replaceChild(this.options.ownerDocument.createTextNode(el.textContent), el);
                }

            }

        }

    };

}(window, document));
