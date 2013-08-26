function MediumEditor(selector, options) {
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
            sel = window.getSelection();
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
            sel = window.getSelection();
        if (savedSel) {
            sel.removeAllRanges();
            for (i = 0, len = savedSel.length; i < len; i += 1) {
                sel.addRange(savedSel[i]);
            }
        }
    }

    // http://stackoverflow.com/questions/6139107/programatically-select-text-in-a-contenteditable-html-element
    // by Tim Down & yckart
    function selectElementContents(el) {
        var selection = window.getSelection(),
            range = document.createRange();
        range.selectNodeContents(el);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    MediumEditor.prototype = {

        defaults: {
            excludedActions: [],
            anchorInputPlaceholder: 'Paste or type a link',
            diffLeft: 0,
            diffTop: -10,
            firstHeader: 'h3',
            secondHeader: 'h4',
            delay: 0
        },

        init: function (selector, options) {
            this.elements = document.querySelectorAll(selector);
            if (this.elements.length === 0) {
                return;
            }
            this.parentElements = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'q'];
            this.id = document.querySelectorAll('.medium-editor-toolbar').length + 1;
            this.options = extend(options, this.defaults);
            return this.initElements(selector)
                       .initToolbar()
                       .bindSelect()
                       .bindButtons()
                       .bindAnchorForm()
                       .bindWindowActions();
        },

        initElements: function (selector) {
            var i;
            for (i = 0; i < this.elements.length; i += 1) {
                this.elements[i].setAttribute('contentEditable', true);
            }
            return this;
        },

        //TODO: actionTemplate
        toolbarTemplate: function () {
            return '<ul id="medium-editor-toolbar-actions" class="medium-editor-toolbar-actions clearfix">' +
                   '    <li><button class="medium-editor-action medium-editor-action-bold" data-action="bold" data-element="b">B</button></li>' +
                   '    <li><button class="medium-editor-action medium-editor-action-italic" data-action="italic" data-element="i">I</button></li>' +
                   '    <li><button class="medium-editor-action medium-editor-action-underline" data-action="underline" data-element="u">S</button></li>' +
                   '    <li><button class="medium-editor-action medium-editor-action-anchor" data-action="anchor" data-element="a">#</button></li>' +
                   '    <li><button class="medium-editor-action medium-editor-action-header1" data-action="append-' + this.options.firstHeader + '" data-element="' + this.options.firstHeader + '">h1</button></li>' +
                   '    <li><button class="medium-editor-action medium-editor-action-header2" data-action="append-' + this.options.secondHeader + '" data-element="' + this.options.secondHeader + '">h2</button></li>' +
                   '    <li><button class="medium-editor-action medium-editor-action-quote" data-action="append-q" data-element="q">&ldquo;</button></li>' +
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
                checkSelectionWrapper = function (e) {
                    clearTimeout(timer);
                    setTimeout(function () {
                        self.checkSelection(e);
                    }, self.options.delay);
                },
                i;
            for (i = 0; i < this.elements.length; i += 1) {
                this.elements[i].onmouseup = checkSelectionWrapper;
                this.elements[i].onkeyup = checkSelectionWrapper;
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
            var selection = window.getSelection(),
                range = selection.getRangeAt(0),
                boundary = range.getBoundingClientRect();
            this.toolbar.style.top = boundary.top - 5 + window.pageYOffset - this.toolbar.offsetHeight + 'px';
            this.toolbar.style.left = ((boundary.left + boundary.right) / 2) - (this.toolbar.offsetWidth / 2) + 'px';
            return this;
        },

        setToolbarButtonStates: function () {
            var buttons = this.toolbarActions.querySelectorAll('button'),
                i;

            for (i = 0; i < buttons.length; i += 1) {
                buttons[i].className = buttons[i].className.replace(/medium-editor-button-active/g, '')
                                                           .replace(/\s{2}/g, ' ');
                this.showHideButton(buttons[i]);
            }

            this.checkActiveButtons();

            return this;
        },

        showHideButton: function (button) {
            if (this.options.excludedActions.indexOf(button.getAttribute('data-element')) > -1) {
                button.style.display = 'none';
            } else {
                button.style.display = 'block';
            }
        },

        checkActiveButtons: function () {
            var parentNode = this.selection.anchorNode;
            if (!parentNode.tagName) {
                parentNode = this.selection.anchorNode.parentNode;
            }
            while (parentNode.tagName !== undefined && this.parentElements.indexOf(parentNode.tagName) === -1) {
                this.activateButton(parentNode.tagName.toLowerCase());
                parentNode = parentNode.parentNode;
            }
        },

        activateButton: function (tag) {
            var el = this.toolbar.querySelector('[data-element="' + tag + '"]');
            if (el !== null && el.className.indexOf('medium-editor-button-active') === -1) {
                el.className += ' medium-editor-button-active';
            }
        },

        bindButtons: function () {
            var buttons = this.toolbar.querySelectorAll('button'),
                i,
                self = this,
                triggerAction = function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (self.selection === undefined) {
                        self.checkSelection(e);
                    }
                    if (this.className.indexOf('medium-editor-button-active') > -1) {
                        this.className = this.className.replace(/medium-editor-button-active/g, '')
                                             .replace(/\s{2}/g, ' ');
                    } else {
                        this.className += ' medium-editor-button-active';
                    }
                    self.execAction(this.getAttribute('data-action'), e);
                };
            for (i = 0; i < buttons.length; i += 1) {
                buttons[i].onclick = triggerAction;
            }
            return this;
        },

        execAction: function(action, e) {
            if (action.indexOf('append-') > -1) {
                this.appendEl(action.replace('append-', ''));
                this.setToolbarButtonStates();
            } else if (action === 'anchor') {
                this.triggerAnchorAction(e);
            } else {
                document.execCommand(action, null, false);
                this.setToolbarPosition();
            }
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

        appendEl: function (el) {
            var selectionEl = this.selection.anchorNode,
                tagName;
            if (selectionEl && selectionEl.tagName) {
                tagName = selectionEl.tagName.toLowerCase();
            }
            while (this.parentElements.indexOf(tagName) === -1) {
                selectionEl = selectionEl.parentNode;
                tagName = selectionEl.tagName.toLowerCase();
            }
            if (tagName === el) {
                el = 'p';
            }
            el = document.createElement(el);
            this.transferAttributes(selectionEl, el);
            el.innerHTML = selectionEl.innerHTML;
            selectionEl.parentNode.replaceChild(el, selectionEl);
            selectElementContents(el);
            this.bindElementToolbarEvents(el);
        },

        transferAttributes: function (elFrom, elTo) {
            Array.prototype.slice.call(elFrom.attributes).forEach(function(item) {
                elTo.setAttribute(item.name, item.value);
            });
        },

        getFirstChild: function (el) {
            var firstChild = el.firstChild;
            while (firstChild !== null && firstChild.nodeType !== 1) {
                firstChild = firstChild.nextSibling;
            }
            return firstChild;
        },

        bindElementToolbarEvents: function (el) {
            var self = this;
            el.onmouseup = function (e) {
                self.checkSelection(e);
            };
            el.onkeyup = function (e) {
                self.checkSelection(e);
            };
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

            return this;
        },

        createLink: function (input) {
            restoreSelection(this.savedSelection);
            document.execCommand('CreateLink', false, input.value);
            this.showToolbarActions();
            input.value = '';
        },

        bindWindowActions: function () {
            var timerResize,
                self = this;

            window.addEventListener('resize', function(e) {
                clearTimeout(timerResize);
                timerResize = setTimeout(function () {
                    self.setToolbarPosition();
                }, 100);
            });

            return this;
        }
    };
}(window, document));
