/*! medium.editor - v0.1.0 - 2013-06-03 */function mediumEditor(selector, options) {
    'use strict';
    return this.init(selector, options);
}

(function (window, document) {
    'use strict';

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

    // http://stackoverflow.com/questions/5605401/insert-link-in-contenteditable-element
    // by Tim Down
    function saveSelection() {
        var i,
            len,
            ranges,
            sel;
        if (window.getSelection) {
            sel = window.getSelection();
            if (sel.getRangeAt && sel.rangeCount) {
                ranges = [];
                for (i = 0, len = sel.rangeCount; i < len; i += 1) {
                    ranges.push(sel.getRangeAt(i));
                }
                return ranges;
            }
        } else if (document.selection && document.selection.createRange) {
            return document.selection.createRange();
        }
        return null;
    }

    function restoreSelection(savedSel) {
        var i,
            len,
            sel;
        if (savedSel) {
            if (window.getSelection) {
                sel = window.getSelection();
                sel.removeAllRanges();
                for (i = 0, len = savedSel.length; i < len; i += 1) {
                    sel.addRange(savedSel[i]);
                }
            } else if (document.selection && savedSel.select) {
                savedSel.select();
            }
        }
    }

    // http://stackoverflow.com/questions/6846230/javascript-text-selection-page-coordinates
    // by Tim Down
    function getSelectionCoords() {
        var sel = window.selection,
            range,
            rect,
            x = 0,
            y = 0;
        if (sel) {
            if (sel.type !== 'Control') {
                range = sel.createRange();
                range.collapse(true);
                x = range.boundingLeft;
                y = range.boundingTop;
            }
        } else if (window.getSelection) {
            sel = window.getSelection();
            if (sel.rangeCount) {
                range = sel.getRangeAt(0).cloneRange();
                if (range.getClientRects) {
                    range.collapse(true);
                    rect = range.getClientRects()[0];
                    x = rect.left;
                    y = rect.top;
                }
            }
        }
        return [x, y];
    }

    // http://stackoverflow.com/questions/12603397/calculate-width-height-of-the-selected-text-javascript
    // by Tim Down
    function getSelectionDimensions() {
        var sel = document.selection,
            range,
            rect,
            width = 0,
            height = 0;
        if (sel) {
            if (sel.type !== 'Control') {
                range = sel.createRange();
                width = range.boundingWidth;
                height = range.boundingHeight;
            }
        } else if (window.getSelection) {
            sel = window.getSelection();
            if (sel.rangeCount) {
                range = sel.getRangeAt(0).cloneRange();
                if (range.getBoundingClientRect) {
                    rect = range.getBoundingClientRect();
                    width = rect.right - rect.left;
                    height = rect.bottom - rect.top;
                }
            }
        }
        return [width, height];
    }

    // http://stackoverflow.com/questions/6139107/programatically-select-text-in-a-contenteditable-html-element
    // by Tim Down
    function selectElementContents(el) {
        var range = document.createRange(),
            sel = window.getSelection();
        range.selectNodeContents(el);
        sel.removeAllRanges();
        sel.addRange(range);
    }

    mediumEditor.prototype = {
        init: function (selector, options) {
            var defaults = {
                    excludedActions: [],
                    anchorInputPlaceholder: 'Paste or type a link',
                    diffLeft: 0,
                    diffTop: -5,
                    firstHeader: 'h3',
                    secondHeader: 'h4',
                    delay: 0
                };
            this.parentElements = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote'];
            this.id = document.querySelectorAll('.medium-editor-toolbar').length + 1;
            this.options = extend(options, defaults);
            return this.initElements(selector)
                       .initToolbar()
                       .bindSelect()
                       .bindButtons()
                       .bindAnchorForm();
        },

        initElements: function (selector) {
            var i;
            this.elements = document.querySelectorAll(selector);
            for (i = 0; i < this.elements.length; i += 1) {
                this.elements[i].setAttribute('contentEditable', true);
            }
            return this;
        },

        //TODO: actionTemplate
        toolbarTemplate: function () {
            return '<ul id="medium-editor-toolbar-actions" class="medium-editor-toolbar-actions clearfix">' +
                   '    <li><a href="#" class="medium-editor-action medium-editor-action-bold" data-action="bold" data-element="b">B</a></li>' +
                   '    <li><a href="#" class="medium-editor-action medium-editor-action-italic" data-action="italic" data-element="i">I</a></li>' +
                   '    <li><a href="#" class="medium-editor-action medium-editor-action-underline" data-action="underline" data-element="u">S</a></li>' +
                   '    <li><a href="#" class="medium-editor-action medium-editor-action-anchor" data-action="anchor" data-element="a">#</a></li>' +
                   '    <li><a href="#" class="medium-editor-action medium-editor-action-header1" data-action="append-' + this.options.firstHeader + '" data-element="' + this.options.firstHeader + '">h1</a></li>' +
                   '    <li><a href="#" class="medium-editor-action medium-editor-action-header2" data-action="append-' + this.options.secondHeader + '" data-element="' + this.options.secondHeader + '">h2</a></li>' +
                   '    <li><a href="#" class="medium-editor-action medium-editor-action-quote" data-action="append-blockquote" data-element="blockquote">&ldquo;</a></li>' +
                   '</ul>' +
                   '<div class="medium-editor-toolbar-form-anchor" id="medium-editor-toolbar-form-anchor">' +
                   '    <input type="text" value="" placeholder="' + this.options.anchorInputPlaceholder + '"><a href="#">&times;</a>' +
                   '</div>';
        },

        initToolbar: function () {
            this.toolbar = this.createToolbar();
            this.keepToolbarAlive = false;
            this.anchorForm = this.toolbar.querySelector('.medium-editor-toolbar-form-anchor');
            this.toolbarActions = this.toolbar.querySelector('.medium-editor-toolbar-actions');
            return this;
        },

        createToolbar: function () {
            var toolbar = document.createElement('div');
            toolbar.id = 'medium-editor-toolbar-' + this.id;
            toolbar.className = 'medium-editor-toolbar';
            toolbar.innerHTML = this.toolbarTemplate();
            document.getElementsByTagName('body')[0].appendChild(toolbar);
            return toolbar;
        },

        bindSelect: function () {
            var self = this,
                timer = '',
                checkSelection = function (e) {
                    clearTimeout(timer);
                    setTimeout(function () {
                        self.checkSelection(e);
                    }, self.options.delay);
                },
                i;
            for (i = 0; i < this.elements.length; i += 1) {
                this.elements[i].onmouseup = checkSelection;
                this.elements[i].onkeyup = checkSelection;
            }
            return this;
        },

        checkSelection: function (e) {
            var newSelection;
            if (this.keepToolbarAlive !== true) {
                newSelection = window.getSelection();
                if (newSelection.toString().trim() === '') {
                    this.toolbar.style.display = 'none';
                } else {
                    this.selection = newSelection;
                    this.selectionRange = this.selection.getRangeAt(0);
                    this.toolbar.style.display = 'block';
                    this.setToolbarPosition()
                        .setToolbarButtonStates()
                        .showToolbarActions();
                }
            }
            return this;
        },

        setToolbarPosition: function () {
            var coords = getSelectionCoords(),
                selDimensions = getSelectionDimensions();
            this.toolbar.style.left = (coords[0] - (this.toolbar.offsetWidth / 2) + (selDimensions[0] / 2) + this.options.diffLeft) + 'px';
            this.toolbar.style.top = (coords[1] + window.scrollY - this.toolbar.offsetHeight + this.options.diffTop) + 'px';
            return this;
        },

        // TODO: break method
        setToolbarButtonStates: function () {
            var buttons = this.toolbarActions.querySelectorAll('a'),
                i,
                parentNode = this.selection.anchorNode.parentNode;

            for (i = 0; i < buttons.length; i += 1) {
                buttons[i].classList.remove('medium-editor-button-active');
                if (this.options.excludedActions.indexOf(buttons[i].getAttribute('data-element')) > -1) {
                    buttons[i].style.display = 'none';
                } else {
                    buttons[i].style.display = 'block';
                }
            }

            while (parentNode.tagName !== undefined && this.parentElements.indexOf(parentNode.tagName) === -1) {
                this.activateButton(parentNode.tagName.toLowerCase());
                parentNode = parentNode.parentNode;
            }

            return this;
        },

        activateButton: function (tag) {
            var el = this.toolbar.querySelector('a[data-element="' + tag + '"]');
            if (el !== null) {
                el.classList.add('medium-editor-button-active');
            }
        },

        // TODO: break method
        bindButtons: function () {
            var action,
                buttons = this.toolbar.querySelectorAll('a'),
                i,
                self = this,
                triggerAction = function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (this.selection === undefined) {
                        self.checkSelection(e);
                    }
                    this.classList.toggle('medium-editor-button-active');
                    action = this.getAttribute('data-action');
                    if (action.indexOf('append-') > -1) {
                        self.appendEl(action.replace('append-', ''));
                        self.setToolbarButtonStates();
                    } else if (action === 'anchor') {
                        self.triggerAnchorAction(e);
                    } else {
                        document.execCommand(action, null, false);
                    }
                };
            for (i = 0; i < buttons.length; i += 1) {
                buttons[i].onclick = triggerAction;
            }
            return this;
        },

        triggerAnchorAction: function (e) {
            if (this.selection.anchorNode.parentNode.tagName.toLowerCase() === 'a') {
                document.execCommand('unlink', null, false);
            } else {
                if (this.anchorForm.style.display === 'block') {
                    this.showToolbarActions();
                } else {
                    this.showAnchorForm();
                }
            }
            return this;
        },

        // TODO: break method
        appendEl: function (el) {
            var attributes = [],
                firstChild,
                selectionEl = this.selection.anchorNode.parentNode,
                tagName = selectionEl.tagName.toLowerCase(),
                self = this;
            while (this.parentElements.indexOf(tagName) === -1) {
                selectionEl = selectionEl.parentNode;
                tagName = selectionEl.tagName.toLowerCase();
            }
            if (tagName === el) {
                el = 'p';
            }
            Array.prototype.slice.call(selectionEl.attributes).forEach(function(item) {
                attributes.push(item);
            });
            el = document.createElement(el);
            el.innerHTML = selectionEl.innerHTML;
            attributes.forEach(function(item) {
                el.setAttribute(item.name, item.value);
            });
            selectionEl.parentNode.replaceChild(el, selectionEl);
            firstChild = el.firstChild;
            while (firstChild.nodeType !== 1) {
                firstChild = firstChild.nextSibling;
            }
            selectElementContents(firstChild);
            el.onmouseup = function (e) {
                self.checkSelection(e);
            };
            el.onkeyup = function (e) {
                self.checkSelection(e);
            };
            this.setToolbarPosition();
        },

        showToolbarActions: function () {
            var self = this,
                timer;
            this.anchorForm.style.display = 'none';
            this.toolbarActions.style.display = 'block';
            this.keepToolbarAlive = false;
            clearTimeout(timer);
            timer = setTimeout(function () {
                document.onclick = function (e) {
                    self.keepToolbarAlive = false;
                    self.toolbar.style.display = 'none';
                    this.onclick = '';
                };
            }, 300);
        },

        showAnchorForm: function () {
            var input = this.anchorForm.querySelector('input');
            this.toolbarActions.style.display = 'none';
            this.savedSelection = saveSelection();
            this.anchorForm.style.display = 'block';
            this.keepToolbarAlive = true;
            input.focus();
            input.value = '';
        },

        bindAnchorForm: function () {
            var input = this.anchorForm.querySelector('input'),
                linkCancel = this.anchorForm.querySelector('a'),
                self = this;

            this.anchorForm.onclick = function (e) {
                e.stopPropagation();
            };

            input.onkeyup = function (e) {
                if (e.keyCode === 13) {
                    e.preventDefault();
                    self.createLink(this);
                }
            };

            linkCancel.onclick = function (e) {
                self.showToolbarActions();
                restoreSelection(self.savedSelection);
            };
        },

        createLink: function (input) {
            restoreSelection(this.savedSelection);
            document.execCommand('CreateLink', false, input.value);
            this.showToolbarActions();
            input.value = '';
        }
    };
}(window, document));
