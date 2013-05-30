/*global saveSelection*/
/*global restoreSelection*/
/*global selectElementContents*/
/*global getElementDefaultDisplay*/
/*global findPos*/
/*global console*/

function mediumEditor(selector, options) {
    'use strict';
    return this.init(selector, options);
}

(function (window, document) {
    'use strict';
    mediumEditor.prototype = {
        init: function (selector, options) {
            return this.initElements(selector)
                       .initToolbar()
                       .bindSelect()
                       .bindButtons()
                       .bindAnchorForm();
        },

        initElements: function (selector) {
            var elements = document.querySelectorAll(selector),
                i;
            for (i = 0; i < elements.length; i += 1) {
                elements[i].setAttribute('contentEditable', true);
            }
            return this;
        },

        initToolbar: function () {
            this.toolbar = this.getOrCreateToolbar();
            this.keepToolbarAlive = false;
            this.anchorForm = document.getElementById('medium-editor-toolbar-form-anchor');
            this.toolbarActions = document.getElementById('medium-editor-toolbar-actions');
            return this;
        },

        // TODO: show toolbar buttons based on options
        // TODO: parametrize input placeholder
        getOrCreateToolbar: function () {
            var toolbar = document.getElementById('medium-editor-toolbar');
            if (toolbar === null) {
                toolbar = document.createElement('div');
                toolbar.id = 'medium-editor-toolbar';
                toolbar.className = 'medium-editor-toolbar';
                toolbar.innerHTML = '<ul class="clearfix" id="medium-editor-toolbar-actions">' +
                                    '    <li><a href="#" data-action="bold" data-element="b">B</a></li>' +
                                    '    <li><a href="#" data-action="italic" data-element="i">I</a></li>' +
                                    '    <li><a href="#" data-action="underline" data-element="u">S</a></li>' +
                                    '    <li><a href="#" data-action="anchor" data-element="a">#</a></li>' +
                                    '    <li><a href="#" data-action="append-h3" data-element="h3">h1</a></li>' +
                                    '    <li><a href="#" data-action="append-h4" data-element="h4">h2</a></li>' +
                                    '    <li><a href="#" data-action="append-blockquote" data-element="blockquote">"</a></li>' +
                                    '</ul>' +
                                    '<div class="medium-editor-toolbar-form-anchor" id="medium-editor-toolbar-form-anchor">' +
                                    '    <input type="text" value="" placeholder="Digite ou cole um link"><a href="#">x</a>' +
                                    '</div>';
                document.getElementsByTagName('body')[0].appendChild(toolbar);
            }
            return toolbar;
        },

        bindSelect: function () {
            var self = this;
            document.onmouseup = function (e) {
                self.checkSelection(e);
            };
            document.onkeyup = function (e) {
                self.checkSelection(e);
            };
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
                    this.setToolbarPosition();
                    this.setToolbarButtonStates();
                    this.toolbar.style.display = 'block';
                    this.showToolbarActions();
                }
            }
            return this;
        },

        setToolbarPosition: function () {
            var coords = this.getSelectionCoordinates();
            this.toolbar.style.left = (coords[0] + 20) + 'px';
            this.toolbar.style.top = (coords[1] + 20) + 'px';
        },

        setToolbarButtonStates: function () {
            var buttons = this.toolbar.querySelectorAll('a'),
                i,
                parentNode = this.selection.anchorNode.parentNode;

            for (i = 0; i < buttons.length; i += 1) {
                buttons[i].classList.remove('medium-editor-button-active');
            }

            while (getElementDefaultDisplay(parentNode.tagName) !== 'block') {
                this.activateButton(parentNode.tagName.toLowerCase());
                parentNode = parentNode.parentNode;
            }
            this.activateButton(parentNode.tagName.toLowerCase());
        },

        activateButton: function (tag) {
            var el = this.toolbar.querySelector('a[data-element="' + tag + '"]');
            if (el !== null) {
                el.classList.add('medium-editor-button-active');
            }
        },

        getSelectionCoordinates: function () {
            var box,
                posEl = document.createElement('span'),
                range = this.selection.getRangeAt(0);
            posEl.innerHTML = this.selection.toString();
            posEl.style.backgroundColor = 'red';
            range.insertNode(posEl);
            box = findPos(posEl);
            posEl.parentNode.removeChild(posEl);
            this.selection.addRange(range);
            return [box[0], box[1]];
        },

        // TODO: break method
        bindButtons: function () {
            var action,
                buttons = this.toolbar.querySelectorAll('a'),
                i,
                self = this,
                triggerAction = function (e) {
                    e.preventDefault();
                    this.classList.toggle('medium-editor-button-active');
                    action = this.getAttribute('data-action');
                    if (action.indexOf('append-') > -1) {
                        self.appendEl(action.replace('append-', ''));
                    } else if (action === 'anchor') {
                        if (self.selection.anchorNode.parentNode.tagName.toLowerCase() === 'a') {
                            document.execCommand('unlink', null, false);
                        } else {
                            if (self.anchorForm.style === 'block') {
                                self.showToolbarActions();
                            } else {
                                self.showAnchorForm();
                            }
                        }
                    } else {
                        document.execCommand(action, null, false);
                    }
                };
            for (i = 0; i < buttons.length; i += 1) {
                buttons[i].onclick = triggerAction;
            }
            return this;
        },

        appendEl: function (el) {
            var selectionEl = this.selection.anchorNode.parentNode,
                tagName = selectionEl.tagName.toLowerCase();
            if (tagName === el || tagName === 'span') {
                el = 'p';
            }
            while (getElementDefaultDisplay(tagName) !== 'block') {
                selectionEl = selectionEl.parentNode;
                tagName = selectionEl.tagName.toLowerCase();
            }
            el = document.createElement(el);
            el.innerHTML = selectionEl.innerHTML;
            el.setAttribute('contentEditable', true);
            selectionEl.parentNode.replaceChild(el, selectionEl);
            selectElementContents(el.firstChild);
            this.setToolbarPosition();
        },

        showToolbarActions: function () {
            this.anchorForm.style.display = 'none';
            this.toolbarActions.style.display = 'block';
            this.keepToolbarAlive = false;
            document.onclick = '';
        },

        showAnchorForm: function () {
            var input = this.anchorForm.querySelector('input'),
                self = this;
            this.toolbarActions.style.display = 'none';
            this.savedSelection = saveSelection();
            this.anchorForm.style.display = 'block';
            this.keepToolbarAlive = true;
            input.focus();
            input.value = '';
            clearTimeout(this.timer);
            this.timer = setTimeout(function () {
                document.onclick = function (e) {
                    self.keepToolbarAlive = false;
                    self.toolbar.style.display = 'none';
                    this.onclick = '';
                };
            }, 300);
        },

        bindAnchorForm: function () {
            var input = this.anchorForm.querySelector('input'),
                linkCancel = this.anchorForm.querySelector('a'),
                self = this;

            this.anchorForm.onclick = function (e) {
                e.stopPropagation();
            };

            input.onkeydown = function (e) {
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
